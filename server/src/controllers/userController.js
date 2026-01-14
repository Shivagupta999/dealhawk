const User = require('../models/User');

exports.getMe = async (req, res) => {
  try {
    const user = req.user;

    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      totalSavings: user.totalSavings || 0,
      createdAt: user.createdAt
    });
  } catch (err) {
    console.error('❌ getMe error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

