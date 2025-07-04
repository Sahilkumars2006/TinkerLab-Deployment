import jwt from 'jsonwebtoken';
import { RequestHandler } from 'express';
import { storage } from './storage';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'faculty' | 'admin';
  profileImageUrl?: string;
}

export const createToken = (user: User) => {
  return jwt.sign(
    { 
      sub: user.id, 
      email: user.email, 
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      profileImageUrl: user.profileImageUrl
    }, 
    JWT_SECRET, 
    { expiresIn: '7d' }
  );
};

export const verifyToken: RequestHandler = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '') || 
                req.cookies?.token;
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = { claims: decoded };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Simple login endpoint for testing
export const setupSimpleAuth = (app: any) => {
  app.post('/api/simple-login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // For demo purposes, accept any email/password
      // In production, you should validate against your database
      const user: User = {
        id: email,
        email,
        firstName: 'Demo',
        lastName: 'User',
        role: 'student',
        profileImageUrl: 'https://via.placeholder.com/150'
      };
      
      const token = createToken(user);
      
      // Store user in database if not exists
      await storage.upsertUser({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
      });
      
      res.json({ 
        token, 
        user,
        message: 'Login successful' 
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Login failed' });
    }
  });
  
  app.post('/api/simple-logout', (req, res) => {
    res.json({ message: 'Logged out successfully' });
  });
}; 