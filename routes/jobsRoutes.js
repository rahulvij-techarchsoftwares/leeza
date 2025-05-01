const express = require("express");
const router = express.Router();
const { authenticate } = require("../controllers/userController");
const { addJobPost, getAllJobs, getUserMatchingJobs, getparticularCompanyJobsWithDetails, deleteJobPostByCompany, editJobPost } = require("../controllers/jobsController");

router.post("/add-job", authenticate, addJobPost);
router.get('/get-all-jobs', authenticate, getAllJobs);
router.get('/user-matching-jobs', authenticate, getUserMatchingJobs);
router.get('/my-company-jobs', authenticate, getparticularCompanyJobsWithDetails);
router.delete('/delete-company-job/:jobId', authenticate, deleteJobPostByCompany);
router.put('/edit-company-job/:jobId', authenticate, editJobPost);

module.exports = router;
