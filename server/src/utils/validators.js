const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};
const validatePassword = (password) => {
  return password && password.length >= 6;
};
const validatePhone = (phone) => {
  const re = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
  return !phone || re.test(phone);
};
const validateOTP = (otp) => {
  return otp && /^\d{6}$/.test(otp);
};
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

const validateRegister = (req, res, next) => {
  const { name, email, password, phone } = req.body;

  if (!name || name.trim().length < 2) {
    return res.status(400).json({ message: 'Name is required' });
  }
  if (!validateEmail(email)) {
    return res.status(400).json({ message: 'Invalid email' });
  }
  if (!validatePassword(password)) {
    return res.status(400).json({
      message: 'Password must be at least 6 characters'
    });
  }
  if (!validatePhone(phone)) {
    return res.status(400).json({ message: 'Invalid phone number' });
  }

  req.body.name = sanitizeInput(name);
  req.body.email = sanitizeInput(email);
  if (phone) req.body.phone = sanitizeInput(phone);

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!validateEmail(email) || !password) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  req.body.email = sanitizeInput(email);
  next();
};

module.exports = {
  validateEmail,
  validatePassword,
  validatePhone,
  validateOTP,
  sanitizeInput,
  validateRegister,
  validateLogin
};
