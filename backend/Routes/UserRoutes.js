const express = require("express");
const router = express.Router();
const User = require("../Controllers/User");

router.post("/", User.addUsers);
router.post("/login", User.loginUser);
router.get("/:id",User.getById);
router.get("/admin/users", User.getAllUsers);
router.delete("/:id", User.deleteUser);

module.exports = router;