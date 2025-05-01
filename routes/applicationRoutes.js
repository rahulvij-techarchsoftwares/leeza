const express = require('express');
const router = express.Router();
const { addApplication, getUserApplicationsDetailed, getJobApplicationsForCompany, getUserSingleApplicationDetailed, updateApplicationStatus } = require('../controllers/applicationController');
const { authenticate } = require("../controllers/userController");

router.post('/apply-job', authenticate, addApplication);
router.get('/user-all-applied', authenticate, getUserApplicationsDetailed);
router.get('/company-job-applications/:job_id', authenticate, getJobApplicationsForCompany);
router.get('/user-application/:application_id', authenticate, getUserSingleApplicationDetailed);
router.put('/change-applications-status/:application_id', authenticate, updateApplicationStatus);


module.exports = router;
