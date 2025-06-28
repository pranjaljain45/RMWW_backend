const express = require("express");
const router = express.Router();
const { registerUser } = require("../controllers/authController");

router.post("/signup", registerUser);

module.exports = router;
