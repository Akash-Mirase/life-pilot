const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ message: 'Email already registered.' });

    const user = await User.create({ name: name.trim(), email: email.toLowerCase(), password });
    const token = generateToken(user._id);

    res.status(201).json({ token, user: user.toSafeObject() });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required.' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Update last active
    user.lastActiveDate = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);
    res.json({ token, user: user.toSafeObject() });
  } catch (err) { next(err); }
};

exports.getMe = async (req, res) => {
  res.json({ user: req.user.toSafeObject ? req.user.toSafeObject() : req.user });
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, bio, email } = req.body;
    const updates = {};
    if (name) updates.name = name.trim();
    if (bio !== undefined) updates.bio = bio;
    if (email) updates.email = email.toLowerCase();

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true }).select('-password');
    res.json({ user });
  } catch (err) { next(err); }
};

exports.updateSettings = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { settings: req.body },
      { new: true }
    ).select('-password');
    res.json({ user });
  } catch (err) { next(err); }
};

// Create demo user if not exists (for hackathon demo)
exports.ensureDemo = async () => {
  try {
    const demo = await User.findOne({ email: 'demo@lifepilot.ai' });
    if (!demo) {
      await User.create({ name: 'Demo User', email: 'demo@lifepilot.ai', password: 'demo1234' });
      console.log('✅ Demo user created: demo@lifepilot.ai / demo1234');
    }
  }  catch (err) {
       console.error("ensureDemo error:");
       console.error(err);
  }
};
