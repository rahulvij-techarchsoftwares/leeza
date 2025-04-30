const express = require("express");
const router = express.Router();
const { addJobPost } = require("../controllers/jobsController");

router.post("/add-job", addJobPost);

module.exports = router;
