const express = require("express")
const router = express.Router()
const {registerSeller, loginSeller, getMe, forgotSellerPassword, getSellerForgotPassword, postSellerForgotPassword} = require("../controllers/sellerController")
const {protected} = require("../middleware/sellerMiddleware")
 
router.post("/", registerSeller)
router.post("/login", loginSeller)
router.get("/me", getMe)
router.post("/forgot-password", forgotSellerPassword)
router.get("/forgotseller-password/:id/:token", getSellerForgotPassword)
router.post("/forgot-password/:id/:token", postSellerForgotPassword)

module.exports = router