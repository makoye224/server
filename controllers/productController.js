const asyncHandler = require("express-async-handler");
const { Product } = require("../models/models");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const multer = require("multer");
const { S3Storage } = require("multer-s3");

const s3Client = new S3Client({
  region: process.env.S3_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS,
  },
});

const s3Upload = (bucketName) => {
  const s3Storage = new S3Storage({
    s3Client,
    bucket: bucketName,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      cb(null, Date.now().toString() + "-" + file.originalname);
    },
  });

  return multer({ storage: s3Storage });
};

// @desc Get products
//@route GET/api/products
//@access Private
const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ user: req.user.id });
  res.status(200).json(products);
});

// @desc Get all products
//@route GET/api/products/all
//@access Private
const getAllProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({});
  res.status(200).json(products);
});

// @desc Set product
//@route POST/api/products
//@access Private
const setProducts = asyncHandler(async (req, res) => {
    if (
      !req.body.title ||
      !req.body.description ||
      !req.body.unit_price ||
      !req.body.inventory ||
      !req.body.seller ||
      !req.files || !req.files.images // Assuming the uploaded files are in the 'images' field
    ) {
      res.status(400);
      throw new Error("Please add all fields and provide images");
    }
  
    const files = req.files.images; // Assuming the uploaded files are in the 'images' field
    const bucketName = process.env.BUCKET_NAME; // Replace with your S3 bucket name
    const cdnBaseUrl = process.env.CDN_URL; // Replace with your CDN base URL
  
    const imageUrls = [];
  
    const uploadPromises = files.map((file) => {
      const uploadParams = {
        Bucket: bucketName,
        Key: `${Date.now().toString()}-${file.name}`,
        Body: file.data,
        ContentType: file.mimetype,
        ACL: 'public-read',
      };
  
      const s3Client = new aws.S3({
        accessKeyId: process.env.ACCESS_KEY,
        secretAccessKey: process.env.SECRET_ACCESS,
        region: process.env.S3_BUCKET_REGION,
      });
  
      return s3Client.upload(uploadParams).promise()
        .then((uploadResult) => {
          const cdnUrl = cdnBaseUrl + '/' + uploadParams.Key;
          imageUrls.push(cdnUrl);
        });
    });
  
    await Promise.all(uploadPromises);
  
    const product = await Product.create({
      title: req.body.title,
      description: req.body.description,
      unit_price: req.body.unit_price,
      inventory: req.body.inventory,
      collections: req.body.collections,
      seller: req.body.seller,
      imageUrls,
    });
  
    console.log("Success");
    res.status(200).json(product);
  });
   

// @desc Update product
//@route PUT/api/products/:id
//@access Private
const updateProducts = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(400);
    throw new Error("Product not found");
  }

  //check for user
  if (!req.user) {
    res.status(401);
    throw new Error("User not found");
  }

  //make sure the logged-in user matches the product user
  if (product.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("User not authorized");
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.status(200).json(updatedProduct);
});

// @desc Delete product
//@route DELETE/api/products/:id
//@access Private
const deleteProducts = asyncHandler(async (req, res) => {
  const result = await Product.deleteMany();

  if (result.deletedCount === 0) {
    res.status(400);
    throw new Error("Failed to delete all products");
  }

  res.status(200).json({ message: "All products deleted successfully" });
});

module.exports = {
  getProducts,
  setProducts,
  updateProducts,
  deleteProducts,
  getAllProducts,
};
