const express = require("express");
const MembershipController = require("../Controllers/MembershipController");

const router = express.Router();

router.post("/join", MembershipController.joinSociety);

module.exports = router;