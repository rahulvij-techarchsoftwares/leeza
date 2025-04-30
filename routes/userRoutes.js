const express = require("express");
const router = express.Router();
const { signupUser, loginUser, forgotPassword } = require("../controllers/userController");

router.post("/signup", signupUser);
router.post("/login", loginUser);
router.post("/reset-pass", forgotPassword);

module.exports = router;
