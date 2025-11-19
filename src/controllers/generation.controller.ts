import { Request, Response } from "express";
import { z } from "zod";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  createGenerationRecord,
  getGenerationsForUser,
} from "../services/generation.service";
import path from "path";
import fs from "fs";
import { sleep } from "../utils/sleep";

// Validation schema for query params
const getSchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
});

// Allowed styles (3+)
const ALLOWED_STYLES = ["cartoon", "3d-render", "oil-painting", "editorial"];

/**
 * Normalize Zod issues into a stable shape for JSON responses.
 * Convert each path element to string to avoid symbol/other types.
 */
function mapZodIssues(issues: z.ZodIssue[]) {
  return issues.map((i) => ({
    path: i.path.map((p) => String(p)),
    message: i.message,
  }));
}

export async function postGenerationHandler(req: AuthRequest, res: Response) {
  // multipart handled by multer
  const prompt = req.body.prompt as string | undefined;
  const style = req.body.style as string | undefined;
  const file = (req as any).file;

  // basic validation
  if (!file) {
    return res.status(400).json({
      error: { code: "VALIDATION_ERROR", message: "Image file required" },
    });
  }
  if (prompt && prompt.length > 1000) {
    return res.status(400).json({
      error: { code: "VALIDATION_ERROR", message: "Prompt too long" },
    });
  }
  if (style && !ALLOWED_STYLES.includes(style)) {
    return res
      .status(400)
      .json({ error: { code: "VALIDATION_ERROR", message: "Invalid style" } });
  }

  // Simulate processing delay 1-2s
  await sleep(1000 + Math.floor(Math.random() * 1000));

  // 20% overload
  if (Math.random() < 0.2) {
    return res.status(503).json({ message: "Model overloaded" });
  }

  // For this mock, we'll "pretend" the result image is same as input (copy file)
  const uploadDir = process.env.UPLOAD_DIR || "uploads";
  const ext = path.extname(file.filename);
  const resultFilename = `result-${file.filename}`;
  const sourcePath = path.join(uploadDir, file.filename);
  const destPath = path.join(uploadDir, resultFilename);

  // create a copy to simulate generated output
  fs.copyFileSync(sourcePath, destPath);

  // save to DB
  const user = req.user!;
  const rec = createGenerationRecord(
    user.id,
    prompt,
    style,
    `/uploads/${file.filename}`,
    `/uploads/${resultFilename}`,
    "completed"
  );

  res.status(201).json({
    id: rec.id,
    imageUrl: rec.result_image_path,
    prompt: rec.prompt,
    style: rec.style,
    createdAt: rec.created_at,
    status: rec.status,
  });
}

export function getGenerationsHandler(req: AuthRequest, res: Response) {
  const parsed = getSchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid query",
        details: mapZodIssues(parsed.error.issues),
      },
    });
  }
  const limit = parsed.data.limit || 5;
  const user = req.user!;
  const rows = getGenerationsForUser(user.id, limit);
  // Map to response shape
  const mapped = rows.map((r: any) => ({
    id: r.id,
    imageUrl: r.result_image_path || r.input_image_path,
    prompt: r.prompt,
    style: r.style,
    createdAt: r.created_at,
    status: r.status,
  }));
  res.json(mapped);
}
