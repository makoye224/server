const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const asyncHandler = require("express-async-handler")
const Seller = require("../models/sellerModel")
const nodemailer = require('nodemailer')

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.PORT,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD,
    },
  });

// @desc Register new seller
//@route POST/api/sellers
//@access Public 
const registerSeller = asyncHandler(async(req, res) => {
   console.log(`seller registration ${req.body.email}`)
    const {name, email, password, businessName, businessType} = req.body
    if(!name || !email || !password || !businessName || !businessType){
        res.status(400)
        throw new Error("Please add all fields")
    }

    // check if user exists 
    const sellerExists = await Seller.findOne({email})
    if(sellerExists){
        res.status(400)
        throw new Error("Seller already exists")
    }

    //hash password 
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    //create user 

    const seller = await Seller.create({
        name, 
        email,
        businessName,
        businessType,
        password: hashedPassword
        
    })
    if(seller){
        res.status(201).json({
            _id: seller.id,
            name: seller.name,
            email: seller.email,
            businessName: seller.businessName,
            businessType: seller.businessType,
            token: generateToken(seller._id) 
        })
    }
    else{
        res.status(400)
        throw new Error("Invalid seller data")
    }
    res.json({message: "Register Seller"})
})



// @desc Authenticate a seller
//@route POST/api/users/login
//@access Public 
const loginSeller = asyncHandler(async(req, res) => {
    const {email, password} = req.body
    //check for user email
    const seller = await Seller.findOne({email})

    if(seller && (await bcrypt.compare(password, seller.password))){
        res.json({
            _id: seller.id,
            name: seller.name,
            email: seller.email,
            token: generateToken(seller._id)
        })
    }
    else{
        res.status(400)
        throw new Error("Invalid credentials")
    }
})

// @desc    Get user data
// @route   GET /api/seller/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    res.status(200).json(req.seller)
  })

  // @desc     Change user password
// @route   POST /api/users/me
// @access  Private
const forgotSellerPassword = asyncHandler(async (req, res) => {
    const {email} = req.body
    try{
      // check if user exists 
    const sellerExists = await Seller.findOne({email})
    if(!sellerExists){
        res.status(400)
        throw new Error("User does not exist")
       //return res.send("User does not exist")
    }
    const jwt = require('jsonwebtoken');
    const payload = {
        id: sellerExists._id,
        email: sellerExists.email
    };
    const secret = process.env.JWT_SECRET;
    const token = jwt.sign(payload, secret, { expiresIn: '60m' });
    const link = `http://localhost:5200/api/users/forgot-password/${sellerExists._id}/${token}`;
    
    // send email with reset link
    const mailOptions = {
        from: process.env.EMAIL_ADDRESS, // sender address
        to: sellerExists.email, // list of receivers
        subject: 'Reset your password', // Subject line
        html: `<p>Hi ${sellerExists.name},</p><p>You have requested to reset your password. Please click the link below to reset your password:</p><a href="${link}">${link}</a><p>This link will expire in 1 hour.</p>`, // html body
      };
  
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          throw new Error('Failed to send email');
        }
        console.log('Message sent: %s', info.messageId);
        res.status(200).json(sellerExists);
      });
    console.log(link)
    res.status(200).json(sellerExists)
    } catch(error){
        res.status(400)
        throw new Error("invalid input")
    }
   
  })

// @desc    Get user data
// @route   GET /forgot-password/:id/:token
// @access  Public
const getSellerForgotPassword = asyncHandler(async (req, res) => {
    const { id, token } = req.params;
    console.log(`just checking`)
    try {
      // check if user exists
      const sellerExists = await Seller.findOne({ _id: id });
  
      if (!sellerExists) {
        return res.status(400).send("Seller does not exist");
      }
  
      const secret = process.env.JWT_SECRET;
      
      // verify the token
      const payload = jwt.verify(token, secret);
      const email = payload.email;
  
      // render the HTML page with the email
      res.render("index", {email: email, status: "not verified"})
    } catch (error) {
      res.status(400);
      throw new Error("Not verified");
    }
  });
  

    // @desc    update user password
// @route   POST /api/users/me
// @access  Private
const postSellerForgotPassword = asyncHandler(async (req, res) => {
    
    const {id, token} = req.params
    const {newpassword} = req.body
    console.log(`my new password ${newpassword}`)
       // check if user exists 
       const sellerExists = await Seller.findOne({_id: id})
      
       // console.log(userExists.password)
        if(!sellerExists){
            return res.send("Seller does not exist")
        }
        const secret = process.env.JWT_SECRET
        try{
            
            const verify = jwt.verify(token, secret)
             //hash password 
             const salt = await bcrypt.genSalt(10)
             const hashedPassword = await bcrypt.hash(newpassword, salt) 
             console.log("check point 10")
             await Seller.updateOne(
                {
                    _id: id,
                },
                {
                    $set:{
                        password: hashedPassword,
                    },
                }
             )
             res.render("index", {email: verify.email, status: "verified"})
            res.send("Password Updated")
        }catch(error){
            res.status(400)
            throw new Error("Something went wrong")
        }
        
    res.status(200).json(req.params)
    console.log(req.body)
    res.send("done")
  })

//generate user token 
const generateToken = (id) => {
    return  jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: "30d", 
    })
}



module.exports = {
     registerSeller,
     loginSeller,
     getMe,
     forgotSellerPassword,
     getSellerForgotPassword,
     postSellerForgotPassword
}