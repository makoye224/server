const express = require("express");
const router = express.Router(); 
const {getProducts, setProducts, updateProducts, deleteProducts, getAllProducts}  = require("../controllers/productController")
const {protect} = require("../middleware/authMiddleware")

router.route("/").get(protect, getProducts).post(protect, setProducts)
router.route("/:id").put(protect, updateProducts).delete(protect, deleteProducts)
router.route('/all').get(getAllProducts)

module.exports = router 