const { Product } = require('../models/models');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');

const bucketName = process.env.BUCKET_NAME;
const cdnBaseUrl = process.env.CDN_URL;

const s3Client = new S3Client({
  region: process.env.S3_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS,
  },
});

const s3Upload = (bucketName) => {
  return multer({
    storage: multer.memoryStorage(),
  }).array('images', 5);
};

const createProduct = async (req, res) => {
  const uploadMultiple = s3Upload(bucketName);

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
  console.log(req.file)
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

    const { unit_price, inventory, description, seller, title, collections } = req.body;
   console.log(seller)
    try {
      const uniqueFileNames = [];
      // Upload images to the S3 bucket
      const uploadPromises = req.files.map((file) => {
        const uniqueFileName = `${uuidv4()}-${title}-${file.originalname}`;
        uniqueFileNames.push(uniqueFileName);
        const params = {
          Bucket: bucketName,
          Key: uniqueFileName,
          Body: file.buffer,
        };
        return s3Client.send(new PutObjectCommand(params));
      });

      await Promise.all(uploadPromises);
      
      const imageUrls = req.files.map((file, index) => `${cdnBaseUrl}/${uniqueFileNames[index]}`);

      // Create a new product with the uploaded image details
      const product = await Product.create({
        title,
        unit_price,
        inventory,
        description,
        seller: seller,
        collections,
        imageUrls,
      });

      console.log(product);
      res.status(200).json(product);
    } catch (error) {
      console.log(`checking ${error.message}`);
      res.status(400).json({ error: error.message });
    }
  });
};


//get all products
const getProducts = async (req, res) => {
    try {
        const products = await Product.find({}).sort({ createdAt: -1 })
        res.status(200).json(products)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

//get a single product 
const getProduct = async (req, res) => {
    const { id } = req.params
    try {
        const product = await Product.findById(id)
        if (!product) {
            return res.status(404).json({ error: 'No such product' })
        }
        res.status(200).json(product)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}


//delete a product
const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findByIdAndDelete(id);

    const imageUrls = product.imageUrls.map((image) => image.location);

    const deleteParams = {
      Bucket: bucketName,
      Delete: {
        Objects: imageUrls.map((imageUrl) => ({
          Key: extractKeyFromUrl(imageUrl),
        })),
      },
    };

    deleteParams.Delete.Objects.forEach((obj) => {
      console.log(obj.Key);
    });

    await s3Client.send(new DeleteObjectsCommand(deleteParams));

    res.status(200).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateProduct = async (req, res) => {
  const { id } = req.params;
  console.log("update");
  try {
    const product = await Product.findById(id);

    // Store the original image URLs
    const originalImageUrls = product.imageUrls.map((image) => image.location);

    // Check if new images are provided
    if (req.files && req.files.length > 0) {
      // Delete the original images from the bucket
      const deleteParams = {
        Bucket: bucketName,
        Delete: {
          Objects: originalImageUrls.map((imageUrl) => ({
            Key: extractKeyFromUrl(imageUrl),
          })),
        },
      };

      await s3Client.send(new DeleteObjectsCommand(deleteParams));

      // Upload new images to the S3 bucket and get the updated image URLs
      const uploadPromises = req.files.map((file) => {
        const uniqueFileName = `${uuidv4()}-${title}-${file.originalname}`;
        const params = {
          Bucket: bucketName,
          Key: uniqueFileName,
          Body: file.buffer,
        };
        return s3Client.send(new PutObjectCommand(params));
      });

      await Promise.all(uploadPromises);

      const imageUrls = req.files.map((file) => `${cdnBaseUrl}/${file.key}`);

      // Update the product with the new values and image URLs
      product.title = req.body.title;
      product.unit_price = req.body.unit_price;
      product.inventory = req.body.inventory;
      product.description = req.body.description;
      product.seller = req.body.seller;
      product.collections = req.body.collections;
      product.imageUrls = imageUrls;

      // Save the updated product
      const updatedProduct = await product.save();

      res.status(200).json(updatedProduct);
    } else {
      // Update the product with the new values from req.body
      product.title = req.body.title;
      product.unit_price = req.body.unit_price;
      product.inventory = req.body.inventory;
      product.description = req.body.description;
      product.seller = req.body.seller;
      product.collections = req.body.collections;

      // Save the updated product
      const updatedProduct = await product.save();

      res.status(200).json(updatedProduct);
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


module.exports = {
    createProduct,
    getProduct,
    getProducts,
    deleteProduct,
    updateProduct
}