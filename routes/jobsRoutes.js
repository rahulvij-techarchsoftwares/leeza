const express = require("express");
const router = express.Router();
const { authenticate } = require("../controllers/userController");
const { addJobPost } = require("../controllers/jobsController");

router.post("/add-job", authenticate, addJobPost);

module.exports = router;
