const User = require("../Models/User");
const Society = require("../Models/SocietyModel");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const contactRegex = /^\+?\d{10,15}$/;

const isUniversityEmail = (email) => {
  const domain = email.split("@")[1] || "";
  return /\.(edu|ac\.[a-z]{2,})$/i.test(domain);
};

const normalizeContactNumber = (contact = "") => contact.trim().replaceAll(/[\s-]/g, "");

const validateBaseUserInput = ({ normalizedEmail, normalizedContact }) => {
  if (!normalizedEmail) {
    return "Email is required.";
  }

  if (!emailRegex.test(normalizedEmail)) {
    return "Enter a valid email address.";
  }

  if (normalizedContact && !contactRegex.test(normalizedContact)) {
    return "Contact number must be 10 to 15 digits.";
  }

  return "";
};

const validateSocietyManagerInput = ({ role, normalizedEmail, normalizedSocietyId }) => {
  if (role !== "societyManager") {
    return "";
  }

  if (!isUniversityEmail(normalizedEmail)) {
    return "Society manager email must be a university email ending with .edu or .ac.xx.";
  }

  if (!normalizedSocietyId) {
    return "Please select a society.";
  }

  return "";
};

const validateSocietyManagerAssignment = async (normalizedSocietyId, excludedUserId) => {
  const existingManagerQuery = { role: "societyManager", societyId: normalizedSocietyId };

  if (excludedUserId) {
    existingManagerQuery._id = { $ne: excludedUserId };
  }

  const [society, existingManager] = await Promise.all([
    Society.findById(normalizedSocietyId).select("_id name societyName"),
    User.findOne(existingManagerQuery).select("_id name"),
  ]);

  if (!society) {
    return "Selected society was not found.";
  }

  if (existingManager) {
    return "This society already has a manager assigned";
  }

  return "";
};

const getNormalizedContactForUpdate = (requestContact, existingContact) => {
  if (requestContact === undefined) {
    return existingContact || "";
  }

  return normalizeContactNumber(requestContact || "");
};

const getNormalizedSocietyIdForUpdate = (role, requestSocietyId, existingSocietyId) => {
  if (role !== "societyManager") {
    return "";
  }

  if (typeof requestSocietyId === "string") {
    return requestSocietyId.trim();
  }

  return existingSocietyId || "";
};

const applyUserUpdates = (existingUser, requestBody, nextRole, normalizedEmail, normalizedContact, normalizedSocietyId) => {
  existingUser.name = requestBody.name ?? existingUser.name;
  existingUser.gmail = normalizedEmail;
  existingUser.role = nextRole;
  existingUser.age = requestBody.age ?? existingUser.age;
  existingUser.address = requestBody.address ?? existingUser.address;
  existingUser.contact = normalizedContact;
  existingUser.societyId = nextRole === "societyManager" ? normalizedSocietyId || undefined : undefined;

  if (typeof requestBody.password === "string" && requestBody.password.trim()) {
    existingUser.password = requestBody.password;
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;

  try {
    const existingUser = await User.findById(id);

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const nextRole = req.body.role || existingUser.role;
    const normalizedEmail = (req.body.gmail ?? existingUser.gmail ?? "").trim().toLowerCase();
    const normalizedContact = getNormalizedContactForUpdate(req.body.contact, existingUser.contact);
    const normalizedSocietyId = getNormalizedSocietyIdForUpdate(nextRole, req.body.societyId, existingUser.societyId);

    const baseValidationMessage = validateBaseUserInput({ normalizedEmail, normalizedContact });
    const societyManagerValidationMessage = validateSocietyManagerInput({
      role: nextRole,
      normalizedEmail,
      normalizedSocietyId,
    });

    if (baseValidationMessage) {
      return res.status(400).json({ message: baseValidationMessage });
    }

    if (societyManagerValidationMessage) {
      return res.status(400).json({ message: societyManagerValidationMessage });
    }

    if (nextRole === "societyManager") {
      const assignmentValidationMessage = await validateSocietyManagerAssignment(normalizedSocietyId, id);

      if (assignmentValidationMessage) {
        return res.status(400).json({ message: assignmentValidationMessage });
      }
    }

    applyUserUpdates(existingUser, req.body, nextRole, normalizedEmail, normalizedContact, normalizedSocietyId);

    await existingUser.save();
    return res.status(200).json({ user: existingUser });
  } catch (err) {
    console.error("Update member error:", err);

    if (err?.code === 11000) {
      return res.status(400).json({ message: "This society already has a manager assigned" });
    }

    if (err.name === "ValidationError") {
      const firstError = Object.values(err.errors)[0];
      return res.status(400).json({ message: firstError?.message || "Invalid user details." });
    }

    return res.status(500).json({ message: "Unable to update member" });
  }
};

//  Register New User
const addUsers = async (req, res) => {
  const { name, gmail, password, role, age, address, contact, societyId } = req.body;
  const normalizedEmail = gmail?.trim().toLowerCase() || "";
  const normalizedContact = normalizeContactNumber(contact || "");
  const normalizedSocietyId = typeof societyId === "string" ? societyId.trim() : "";
  const baseValidationMessage = validateBaseUserInput({ normalizedEmail, normalizedContact });
  const societyManagerValidationMessage = validateSocietyManagerInput({ role, normalizedEmail, normalizedSocietyId });

  if (baseValidationMessage) {
    return res.status(400).json({ message: baseValidationMessage });
  }

  if (societyManagerValidationMessage) {
    return res.status(400).json({ message: societyManagerValidationMessage });
  }

  try {
    if (role === "societyManager") {
      const assignmentValidationMessage = await validateSocietyManagerAssignment(normalizedSocietyId);

      if (assignmentValidationMessage) {
        return res.status(400).json({ message: assignmentValidationMessage });
      }
    }

    // Auto-generate 6-digit PIN for students
    const pin = role === "student"
      ? String(Math.floor(100000 + Math.random() * 900000))
      : undefined;

    const newUser = new User({
      name,
      gmail: normalizedEmail,
      password,
      role,
      age,
      address,
      contact: normalizedContact,
      societyId: normalizedSocietyId || undefined,
      pin,
    });

    await newUser.save();
    return res.status(201).json({ newUser });
  } catch (err) {
    console.error("Add member error:", err);

    if (err?.code === 11000 && role === "societyManager" && normalizedSocietyId) {
      return res.status(400).json({ message: "This society already has a manager assigned" });
    }

    if (err.name === "ValidationError") {
      const firstError = Object.values(err.errors)[0];
      return res.status(400).json({ message: firstError?.message || "Invalid user details." });
    }

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
      return res.status(200).json({
        status: "ok",
        user: {
          _id: user._id,
          gmail: user.gmail,
          role: user.role,
          pin: user.pin || null,
        }
      });
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
exports.updateUser = updateUser;

