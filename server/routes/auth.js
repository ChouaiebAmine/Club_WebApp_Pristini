  import express from 'express';
  import jwt from 'jsonwebtoken';
  import User from '../models/User.js';

  const router = express.Router();

  // new user
  router.post('/register', async (req, res) => {
    try {
      const { name, email, password, phone } = req.body;

      //check user existance
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // create new user
      const user = new User({
        name,
        email,
        password,
        phone,
      });

      await user.save();

      //generate JWT 
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET || 'your_jwt_secret_key_here',
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
      });
    } catch (error) {
      res.status(500).json({ message: 'Error registering user', error: error.message });
    }
  });

  // login 
  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      //find user by mail
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      //compare passwords
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid password' });
      }

      // generate JWT 
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET || 'your_jwt_secret_key_here',
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

      res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
      });
    } catch (error) {
      res.status(500).json({ message: 'Error logging in', error: error.message });
    }
  });

  export default router;
