import jwt from 'jsonwebtoken';
import { RequestHandler } from 'express';
import express, { Request, Response } from "express";
import { z } from "zod";

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
  app.post('/api/simple-login', async (req: Request, res: Response) => {
    console.log('Login request received:', { body: req.body, headers: req.headers });
    
    try {
      const { email, password } = req.body;
      
      console.log('Login attempt for:', email);
      
      // Simple validation
      if (!email || !password) {
        console.log('Login failed: missing email or password');
        return res.status(400).json({ message: 'Email and password are required' });
      }

      // For demo purposes, accept any email/password combination
      // In production, you would validate against a database
      const token = jwt.sign(
        { 
          sub: email, 
          email: email,
          role: 'student', // Default role
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { algorithm: 'HS256' }
      );

      const response = { 
        token,
        user: {
          id: email,
          email: email,
          role: 'student'
        }
      };
      
      console.log('Login successful for:', email);
      console.log('Sending response:', { ...response, token: '***' });
      
      res.json(response);
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Login failed: ' + (error as Error).message });
    }
  });
  
  app.post('/api/simple-logout', (req: Request, res: Response) => {
    // In a real app, you might want to blacklist the token
    res.json({ message: 'Logged out successfully' });
  });

  // Add the missing /api/auth/user endpoint
  app.get('/api/auth/user', verifyToken, (req: Request, res: Response) => {
    try {
      // The user information is already available from verifyToken middleware
      const user = (req as any).user?.claims;
      
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      res.json({
        id: user.sub,
        email: user.email,
        firstName: user.firstName || 'Demo',
        lastName: user.lastName || 'User',
        role: user.role || 'student',
        profileImageUrl: user.profileImageUrl || 'https://via.placeholder.com/150'
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Failed to fetch user information' });
    }
  });
}; 