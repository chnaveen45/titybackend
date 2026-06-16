const User = require("../models/User");

const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  age: user.age,
  email: user.email,
});

const formatValidationErrors = (error) =>
  Object.values(error.errors)
    .map((fieldError) => fieldError.message)
    .join(", ");

const register = async (req, res) => {
  try {
    const { name, age, email, password } = req.body;

    if (!name || !age || !email || !password) {
      return res.status(400).json({ message: "Name, age, email, and password are required" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists with this email" });
    }

    const user = await User.create({ name, age, email, password });

    return res.status(201).json({
      message: "Registration successful",
      user: formatUser(user),
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: formatValidationErrors(error),
      });
    }

    if (error.code === 11000 && error.keyPattern?.email) {
      return res.status(409).json({
        message: "User already exists with this email",
      });
    }

    return res.status(500).json({ message: "Unable to register user" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !user.comparePassword(password)) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    return res.status(200).json({
      message: "Login successful",
      user: formatUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: "Login failed", error: error.message });
  }
};

module.exports = {
  register,
  login,
};
