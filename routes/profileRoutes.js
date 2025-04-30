const express = require("express");
const router = express.Router();
const { authenticate } = require("../controllers/userController");
const profileController = require("../controllers/profileController");

router.post("/edit-profile", authenticate, profileController.addOrUpdateProfile);
router.get("/get-profile", authenticate, profileController.getProfile); 
router.post('/edit-company-profile', authenticate, profileController.addOrUpdateCompanyProfile);
router.get("/get-company-profile", authenticate, profileController.getCompanyProfile);

module.exports = router;
