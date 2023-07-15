const express = require("express");
const router = express.Router(); 
const {getProducts, createProduct, updateProduct, deleteProduct, getProduct}  = require("../controllers/productController")
const {protect} = require("../middleware/authMiddleware")

router.route("/").get(protect, getProducts).post(protect, createProduct)
router.route("/:id").put(protect, updateProduct).delete(protect, deleteProduct).get(protect, getProduct)
router.route('/all').get(protect, getProducts)

module.exports = router 