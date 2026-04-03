const MembershipRequest = require("../Models/MembershipRequestModel");
const Society = require("../Models/SocietyModel");
const User = require("../Models/User");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const studentIdRegex = /^it\d{8}$/i;
const contactRegex = /^\d{10}$/;

const normalizeString = (value = "") => String(value).trim();
const createHttpError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const buildPayload = (body = {}, resolvedManagerId = "") => ({
  user_id: normalizeString(body.user_id),
  club_id: normalizeString(body.club_id),
  club_name: normalizeString(body.club_name),
  manager_id: resolvedManagerId || normalizeString(body.manager_id),
  name: normalizeString(body.name),
  email: normalizeString(body.email).toLowerCase(),
  contact: normalizeString(body.contact),
  student_id: normalizeString(body.student_id),
  faculty: normalizeString(body.faculty),
  year: normalizeString(body.year),
  reason: normalizeString(body.reason),
});

const validateApplication = (payload) => {
  if (!payload.club_id) return "Club ID is required.";
  if (!payload.club_name) return "Club name is required.";
  if (!payload.manager_id) return "Assigned manager was not found for this club.";
  if (!payload.name) return "Full name is required.";
  if (!payload.email) return "Email address is required.";
  if (!emailRegex.test(payload.email)) return "Enter a valid email address.";
  if (!payload.contact) return "Contact number is required.";
  if (!contactRegex.test(payload.contact)) {
    return "Contact number must contain exactly 10 digits.";
  }
  if (!payload.student_id) return "Student ID is required.";
  if (!studentIdRegex.test(payload.student_id)) {
    return "Student ID must be in the format IT22574886 with 8 digits after IT.";
  }
  if (!payload.faculty) return "Faculty is required.";
  if (!payload.year) return "Year is required.";
  if (!payload.reason) return "Reason is required.";
  return "";
};

const resolveStudentUserId = async (userId, email) => {
  const normalizedUserId = normalizeString(userId);
  const normalizedEmail = normalizeString(email).toLowerCase();

  if (normalizedUserId) {
    const existingUser = await User.findById(normalizedUserId).select("_id").lean();

    if (existingUser?._id) {
      return String(existingUser._id);
    }
  }

  if (!normalizedEmail) {
    return "";
  }

  const matchedUser = await User.findOne({ gmail: normalizedEmail }).select("_id").lean();
  return matchedUser?._id ? String(matchedUser._id) : "";
};

const resolveManagerId = async (clubId, fallbackManagerId) => {
  const normalizedClubId = normalizeString(clubId);
  const normalizedFallback = normalizeString(fallbackManagerId);

  if (!normalizedClubId) {
    return normalizedFallback;
  }

  const [society, manager] = await Promise.all([
    Society.findById(normalizedClubId).select("_id name societyName"),
    User.findOne({ role: "societyManager", societyId: normalizedClubId }).select("_id"),
  ]);

  if (!society) {
    throw createHttpError(404, "Selected club was not found.");
  }

  if (!manager) {
    throw createHttpError(400, "This club does not have an assigned manager yet.");
  }

  return String(manager._id);
};

const serializeRequest = (request) => ({
  id: request._id,
  _id: request._id,
  user_id: request.user_id,
  club_id: request.club_id,
  club_name: request.club_name,
  manager_id: request.manager_id,
  name: request.name,
  email: request.email,
  contact: request.contact,
  student_id: request.student_id,
  faculty: request.faculty,
  year: request.year,
  reason: request.reason,
  status: request.status,
  created_at: request.created_at,
  updated_at: request.updated_at,
});

const applyMembership = async (req, res) => {
  try {
    const managerId = await resolveManagerId(req.body.club_id, req.body.manager_id);
    const resolvedUserId = await resolveStudentUserId(req.body.user_id, req.body.email);
    const payload = buildPayload({ ...req.body, user_id: resolvedUserId }, managerId);
    const validationMessage = validateApplication(payload);

    if (validationMessage) {
      return res.status(400).json({ message: validationMessage });
    }

    const membershipRequest = new MembershipRequest({
      ...payload,
      status: "pending",
    });

    await membershipRequest.save();

    return res.status(201).json({
      message: "Membership request submitted successfully.",
      request: serializeRequest(membershipRequest),
    });
  } catch (error) {
    console.error("Apply membership error:", error);
    return res.status(error.status || 500).json({
      message: error.message || "Unable to submit membership request.",
    });
  }
};

const getManagerRequests = async (req, res) => {
  try {
    const managerId = normalizeString(req.params.managerId);

    if (!managerId) {
      return res.status(400).json({ message: "Manager ID is required." });
    }

    const requests = await MembershipRequest.find({ manager_id: managerId })
      .sort({ created_at: -1 })
      .lean();

    return res.status(200).json({ requests: requests.map(serializeRequest) });
  } catch (error) {
    console.error("Get manager membership requests error:", error);
    return res.status(500).json({ message: "Unable to fetch membership requests." });
  }
};

const getStudentRequests = async (req, res) => {
  try {
    const userId = normalizeString(req.params.userId);
    const requestedEmail = normalizeString(req.query.email).toLowerCase();

    if (!userId && !requestedEmail) {
      return res.status(400).json({ message: "Student user ID or email is required." });
    }

    const user = userId
      ? await User.findById(userId).select("_id gmail").lean()
      : null;
    const resolvedEmail = requestedEmail || normalizeString(user?.gmail).toLowerCase();
    const orFilters = [];

    if (userId) {
      orFilters.push({ user_id: userId });
    }

    if (resolvedEmail) {
      orFilters.push({ email: resolvedEmail });
    }

    const query = orFilters.length === 1 ? orFilters[0] : { $or: orFilters };

    const requests = await MembershipRequest.find(query)
      .sort({ created_at: -1 })
      .lean();

    return res.status(200).json({ requests: requests.map(serializeRequest) });
  } catch (error) {
    console.error("Get student membership requests error:", error);
    return res.status(500).json({ message: "Unable to fetch your membership requests." });
  }
};

const updateMembershipStatus = async (req, res) => {
  try {
    const requestId = normalizeString(req.params.id);
    const status = normalizeString(req.body.status).toLowerCase();

    if (!requestId) {
      return res.status(400).json({ message: "Request ID is required." });
    }

    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ message: "Invalid membership request status." });
    }

    const request = await MembershipRequest.findByIdAndUpdate(
      requestId,
      { status },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ message: "Membership request not found." });
    }

    return res.status(200).json({
      message: "Membership request updated successfully.",
      request: serializeRequest(request),
    });
  } catch (error) {
    console.error("Update membership request error:", error);
    return res.status(500).json({ message: "Unable to update membership request." });
  }
};

exports.applyMembership = applyMembership;
exports.getManagerRequests = getManagerRequests;
exports.getStudentRequests = getStudentRequests;
exports.updateMembershipStatus = updateMembershipStatus;