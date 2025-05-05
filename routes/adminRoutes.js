const express = require('express');
const router = express.Router();
const { authenticate } = require("../controllers/userController");
const { getAllUserDetailsForAdmin, getUserDetailsByIdForAdmin, adminAddOrUpdateUserProfile, adminAddOrUpdateCompanyProfile } = require('../controllers/adminController');

router.get('/all-user-details', authenticate, getAllUserDetailsForAdmin);
router.get('/particular-user/:id', authenticate, getUserDetailsByIdForAdmin);
router.post('/edit-user-profile/:id', authenticate, adminAddOrUpdateUserProfile);
router.post('/edit-company-profile/:id', authenticate, adminAddOrUpdateCompanyProfile);

module.exports = router;
