const User = require("../Models/User");

//  Register New User
const addUsers = async (req, res) => {
  const { name, gmail, password, role, age, address, contact, societyId } = req.body;


  try {
    const newUser = new User({
      name,
      gmail,
      password,
      role,
      age,
      address,
      contact,
      societyId,
    });

    await newUser.save();
    return res.status(201).json({newUser });
  } catch (err) {
    console.error("Add member error:", err);
    return res.status(500).json({ message: "Unable to add member" });
  }
};

// Login existing user
const loginUser = async (req, res) => {
  const { gmail, password } = req.body;

  try {
    const user = await User.findOne({ gmail });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.password === password) {
      // Optionally, you can return userId to use in frontend navigation
      return res.status(200).json({ status: "ok", userId: user._id });
    } else {
      return res.status(401).json({ message: "Incorrect password" });
    }
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

//  Get Member by ID
const getById = async (req, res) => {
  const { id } = req.params;

  if (!id || id === "undefined") {
    return res.status(400).json({ message: "Invalid or missing ID" });
  }

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "Member not found" });
    }

    return res.status(200).json({ user });
  } catch (err) {
    console.error("Get by ID error:", err);
    return res.status(500).json({ message: "Error fetching member" });
  }
};

// Get All Users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find(); // Use User model
    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }
    return res.status(200).json({ users });
  } catch (err) {
    console.error("Fetch error:", err);
    return res.status(500).json({ message: "Error retrieving users" });
  }
};


// Delete user account
const deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "User account deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};






exports.addUsers = addUsers;
exports.loginUser= loginUser;
exports.getById= getById;
exports.getAllUsers= getAllUsers;
exports.deleteUser = deleteUser;

