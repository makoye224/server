const express = require("express")
const router = express.Router()
const {registerUser, loginUser, getMe, forgotPassword, getForgotPassword, postForgotPassword} = require("../controllers/userController")
const {protect} = require("../middleware/authMiddleware")
 
router.post("/", registerUser)
router.post("/login", loginUser)
router.get("/me", protect, getMe)
router.post("/forgot-password", forgotPassword)
router.get("/forgot-password/:id/:token", getForgotPassword)
router.post("/forgot-password/:id/:token", postForgotPassword)

module.exports = router