const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
  console.log('[Auth] Signup attempt:', req.body.email);
  try {
    const { name, email, phone, password, isAdmin } = req.body;
    if (!name || !email || !phone || !password) {
      console.warn('[Auth] Signup missing fields:', req.body);
      return res.status(400).json({ message: 'All fields are required' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.warn('[Auth] Signup user exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, phone, password: hashedPassword, isAdmin: !!isAdmin });
    await user.save();
    console.log('[Auth] Signup success:', email);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('[Auth] Signup error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.login = async (req, res) => {
  console.log('[Auth] Login attempt:', req.body.email);
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      console.warn('[Auth] Login missing fields:', req.body);
      return res.status(400).json({ message: 'All fields are required' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      console.warn('[Auth] Login invalid user:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.warn('[Auth] Login invalid password for:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    console.log('[Auth] Login success:', email);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, isAdmin: user.isAdmin } });
  } catch (err) {
    console.error('[Auth] Login error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 