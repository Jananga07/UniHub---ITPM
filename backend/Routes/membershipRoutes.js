const express = require("express");
const MembershipController = require("../Controllers/MembershipController");

const router = express.Router();

router.post("/apply", MembershipController.applyMembership);
router.get("/manager/:managerId", MembershipController.getManagerRequests);
router.get("/student/:userId", MembershipController.getStudentRequests);
router.patch("/:id", MembershipController.updateMembershipStatus);

module.exports = router;