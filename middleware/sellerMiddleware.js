const jwt = require("jsonwebtoken")
const asyncHandler = require("express-async-handler")
const Seller = require("../models/sellerModel")

const protected = asyncHandler(async(req, res, next) => {
    let token
    if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ){
        try{
            //get token from header
            token = req.headers.authorization.split(' ')[1]
            //verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            //get user from the token
            req.seller = await Seller.findById(decoded.id).select('-password')
            next()

        } catch(error){
            console.log(error)
            res.status(401)
            throw new Error("Not Authorized")

        }
    }
    if(!token){
        res.status(401)
        throw new Error("Not Authorize, no token")
    }
})

module.exports = {protected}