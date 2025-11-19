import express from 'express';
import { signupHandler, loginHandler } from '../controllers/auth.controller';

export const authRouter = express.Router();

authRouter.post('/signup', signupHandler);
authRouter.post('/login', loginHandler);
