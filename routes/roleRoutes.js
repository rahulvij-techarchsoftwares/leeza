const express = require("express");
const router = express.Router();
const { addRole, getAllRoles } = require("../controllers/roleController");

router.post("/add-role", addRole);
router.get("/get-roles", getAllRoles);

module.exports = router;
