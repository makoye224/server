const asyncHandler = require("express-async-handler")
const Product = require("../models/productModel")
const User = require("../models/userModel")
// @desc Get goal
//@route GET/api/goals
//@access Private
const getProducts = asyncHandler(async(req, res) => {
    const Products = await Goal.find({user: req.user.id})
    res.status(200).json(Products)
})

// @desc Get all Products
//@route GET/api/Products/all
//@access private
const getAllProducts = asyncHandler(async(req, res) => {
    const Products = await Goal.find({})
    res.status(200).json(Products)
    return Products
})

// @desc Set Product
//@route POST/api/Products
//@access private
const setProducts = asyncHandler(async(req, res) => {
    if(!req.body.name || !req.body.price || !req.body.description
        ||!req.body.photo ){
        res.status(400)
        throw new Error("please add all fields")
    }
    const product = await Product.create({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        photo: req.body.photo,
        video:req.body.video,
        user: req.user.id, 
    })
    console.log(`success`)
    res.status(200).json(goal)
})

// @desc Update Product
//@route PUT/api/Products/:id
//@access Private
const updateProducts = asyncHandler(async(req, res) => {
    const product = await Goal.findById(req.params.id)

    if(!product){
        res.status(400)
        throw new Error("Plan not found")
    }

   
    //check for user 
    if(!req.user){
        res.status(401)
        throw new Error("User not found")
    }
    //make sure the login user match the foal user
    if(product.user.toString() !== req.user.id){
        res.status(401)
        throw new Error("User not Authorized")
    }
    const updatedProduct = await Goal.findByIdAndUpdate(req.params.id, req.body, {new: true})
    res.status(200).json(updateProducts)
})

// @desc Delete Product
//@route DELETE/api/Products/:id
//@access Private
const deleteProducts = asyncHandler(async(req, res) => {
    const result = await Product.deleteMany()
    if(result.deletedCount === 0){
        res.status(400)
        throw new Error("Failed to delete all Products")
    }
    res.status(200).json({message: "All Products deleted successfully"})
})

/*
// @desc Delete goal
//@route DELETE/api/Products/:id
//@access Private
const deleteOneProducts = asyncHandler(async(req, res) => {
    const goal = await Goal.findById(req.params.id)
    if(!goal){
        res.status(400)
        throw new Error("Plan not found")
    }
   
    //check for user 
    if(!req.user){
        res.status(401)
        throw new Error("User not found")
    }
    //make sure the login user match the foal user
    if(goal.user.toString() !== req.user.id){
        res.status(401)
        throw new Error("User not Authorized")
    }
    
    await goal.deleteOne();
    res.status(200).json({id: req.params.id})
})*/

module.exports = {
    getProducts, setProducts, updateProducts, deleteProducts, getAllProducts
}