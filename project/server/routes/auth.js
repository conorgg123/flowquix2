import express from 'express';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Ensure environment variables are loaded
config();

// Debug log to check environment variables
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_SERVICE_KEY exists:', !!process.env.SUPABASE_SERVICE_KEY);

const router = express.Router();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

router.post('/register', async (req, res) => {
  console.log('Register endpoint hit!');
  console.log('Request body:', req.body);
  
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Use Supabase's auth.signUp method instead of direct table insertion
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error('Supabase signup error:', error);
      
      // Handle specific error codes with user-friendly messages
      if (error.code === 'user_already_exists') {
        return res.status(400).json({ message: 'This email is already registered. Please try logging in instead.' });
      }
      
      return res.status(400).json({ message: error.message || 'Registration failed' });
    }

    if (!data.user) {
      return res.status(500).json({ message: 'Failed to create user' });
    }

    // Create JWT for our own auth system
    const token = jwt.sign(
      { userId: data.user.id, email: data.user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({ 
      token, 
      user: { 
        id: data.user.id, 
        email: data.user.email 
      } 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message || 'Error during registration' });
  }
});

router.post('/login', async (req, res) => {
  console.log('Login endpoint hit!');
  console.log('Request body:', req.body);
  
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Use Supabase's auth.signInWithPassword method
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Supabase login error:', error);
      return res.status(401).json({ message: error.message || 'Invalid credentials' });
    }

    if (!data.user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create JWT for our own auth system
    const token = jwt.sign(
      { userId: data.user.id, email: data.user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ 
      token, 
      user: { 
        id: data.user.id, 
        email: data.user.email 
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error during login' });
  }
});

// Validate token endpoint
router.get('/validate', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  console.log('Validate token request received, auth header present:', !!authHeader);
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  console.log('Token received:', token.substring(0, 15) + '...');
  
  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      console.error('Token verification error:', err.message);
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    
    console.log('Token verified successfully for user:', decoded.email);
    
    try {
      // Since we're using our own JWT, we can just use the decoded data
      // instead of fetching from Supabase again
      res.json({ 
        user: {
          id: decoded.userId,
          email: decoded.email
        }
      });
    } catch (error) {
      console.error('Token validation error:', error);
      res.status(500).json({ message: 'Error validating token' });
    }
  });
});

export default router;