const express = require("express");
const MembershipController = require("../Controllers/MembershipController");

const router = express.Router();

router.post("/", MembershipController.createMembership);

module.exports = router;