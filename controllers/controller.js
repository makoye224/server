const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const {Customer, Seller } = require("../models/models");


// @desc Register new user
//@route POST/api/users
//@access Public
const registerUser = asyncHandler(async (req, res) => {
  const {first_name, last_name, phone, email, password, birth_date, business_name, membership} = req.body;
  if (!first_name ||!last_name || !email || !phone || !birth_date || !password) {
    res.status(400);
    throw new Error("Please add all fields");
  }
 
  // check if user exists
  const userExists = await Customer.findOne({ email }) || await Seller.findOne({ email });
  
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  //console.log('check.. ' + business_name + ' ' + password)
  //hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password.toString(), salt);

  //create user
 let user;
  if(business_name){
    user = await Seller.create({
        first_name,
        last_name,
        email,
        birth_date,
        phone,
        business_name,
        password: hashedPassword,
      });
  }
  else{
    user = await Customer.create({
        first_name,
        last_name,
        email,
        birth_date,
        phone,
        membership,
        password: hashedPassword,
      });
  }
  if (user && business_name) {
    res.status(201).json({
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      email: user.email,
      business_name: user.business_name,
      token: generateToken(user._id),
    });
  }
  else if (user && !business_name) {
    res.status(201).json({
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      email: user.email,
      membership: user.membership,
      token: generateToken(user._id),
    });
  } 
  else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// @desc Authenticate a user
//@route POST/api/users/login
//@access Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

   // check if user exists
   const user = await Customer.findOne({ email }) || await Seller.findOne({ email });

  if (user && (await bcrypt.compare(password.toString(), user.password))) {
    res.json({
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      business_name: user.business_name,
      email: user.email,
      membership: user.membership,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid credentials");
  }
});

// @desc    Get user data
// @route   GET /api/users/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(req.user);
});

// @desc     Change user password
// @route   POST /api/users/me
// @access  Private
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  console.log(`checking email ${email}`);
  try {
     // check if user exists
  const userExists = await Customer.findOne({ email }) || await Seller.findOne({ email });
    if (!userExists) {
      res.status(400);
      throw new Error("User does not exist");
    }

    const payload = {
      id: userExists._id,
      email: userExists.email,
    };
    const secret = process.env.JWT_SECRET;
    const token = jwt.sign(payload, secret, { expiresIn: "60m" });

    const link = `http://localhost:4000/api/users/forgot-password/${userExists._id}/${token}`;
    res.json({
      link: link,
    });

    console.log(link);
    res.status(200).json(userExists);
  } catch (error) {
    res.status(400);
    throw new Error("Invalid input");
  }
});

// @desc    Get user data
// @route   GET /forgot-password/:id/:token
// @access  Public
const getForgotPassword = asyncHandler(async (req, res) => {
  const { id, token } = req.params;

  try {
     // check if user exists
  const userExists = await Customer.findOne({ _id: id }) || await Seller.findOne({ _id: id });
  
    if (!userExists) {
      return res.status(400).send("User does not exist");
    }

    const secret = process.env.JWT_SECRET;
    // verify the token
    const payload = jwt.verify(token, secret);
    const email = payload.email;

    

    // render the HTML page with the email
    res.render("index", { email: email, status: "not verified" });
   
  } catch (error) {
    res.status(400);
    console.log(error);
    throw new Error("Not verified");
  }
});

// @desc    update user password
// @route   POST /api/users/me
// @access  Private
const postForgotPassword = asyncHandler(async (req, res) => {
  const { id, token } = req.params;
  const { newpassword } = req.body;
  console.log(`my new password ${newpassword}`);
  // check if user exists
  const userExists = await Customer.findOne({ _id: id });

  if(!userExists){
    userExists = await Seller.findOne({ _id: id });
  }
  // console.log(userExists.password)
  if (!userExists) {
    return res.send("User does not exist");
  }
  const secret = process.env.JWT_SECRET;
  try {
    const verify = jwt.verify(token, secret);
    //hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newpassword, salt);
    console.log("check point 10");
    await User.updateOne(
      {
        _id: id,
      },
      {
        $set: {
          password: hashedPassword,
        },
      }
    );
    res.render("index", { email: verify.email, status: "verified" });
    res.send("Password Updated");
  } catch (error) {
    res.status(400);
    throw new Error("Something went wrong");
  }

  res.status(200).json(req.params);
  console.log(req.body);
  res.send("done");
});

//generate user token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  forgotPassword,
  getForgotPassword,
  postForgotPassword,
};
