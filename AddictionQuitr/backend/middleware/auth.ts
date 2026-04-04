// Auth middleware - Supabase JWT verification

import { Router } from 'express';

// Placeholder auth middleware
// TODO: Implement Supabase JWT verification
export function authMiddleware(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // TODO: Verify JWT with Supabase
  // const token = authHeader.split(' ')[1];
  // const { data, error } = await supabase.auth.getUser(token);

  next();
}

export default authMiddleware;
