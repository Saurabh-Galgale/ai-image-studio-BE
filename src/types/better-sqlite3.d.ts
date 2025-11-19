// src/types/better-sqlite3.d.ts
// Minimal ambient declaration so TS won't complain about missing types.
// You can replace with more specific types later if you want.
declare module "better-sqlite3" {
  // keep it `any` for now to avoid typing friction with the native library
  const Database: any;
  export default Database;
}
