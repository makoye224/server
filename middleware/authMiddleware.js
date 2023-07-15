const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const { Customer, Seller } = require("../models/models");

const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if the token belongs to a seller
      const seller = await Seller.findById(decoded.id).select("-password");
      if (seller) {
        req.seller = seller;
        next();
      } else {
        res.status(401);
        throw new Error("Not Authorized");
      }
    } catch (error) {
      console.log(error);
      res.status(401);
      throw new Error("Not Authorized");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Not Authorized, no token");
  }
});

module.exports = { protect };
