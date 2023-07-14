const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  description: { type: String, required: true },
  discount: { type: Number, required: true },
});

const collectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  featured_product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
});

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  unit_price: { type: mongoose.Schema.Types.Decimal128, required: true },
  inventory: { type: Number, required: true },
  last_update: { type: Date, default: Date.now },
  collections: { type: mongoose.Schema.Types.ObjectId, ref: 'Collection', required: true },
  promotions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Promotion' }],
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
  imageUrls: [{ type: String }] 
});

const customerSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  birth_date: { type: Date },
  password: {
    type: String, 
    required: [true, "please add a password"]
},
  membership: {
    type: String,
    enum: ['B', 'S', 'G'],
    default: 'B',
  },
});

const sellerSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: {
    type: String, 
    required: [true, "please add a password"]
},
  business_name: { type: String, required: true },
});

const orderSchema = new mongoose.Schema({
  placed_at: { type: Date, default: Date.now },
  payment_status: {
    type: String,
    enum: ['P', 'C', 'F'],
    default: 'P',
  },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
});

const orderItemSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  unit_price: { type: mongoose.Schema.Types.Decimal128, required: true },
});

const addressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  house_number: { type: String, required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  zip: { type: String },
});

const cartSchema = new mongoose.Schema({
  created_at: { type: Date, default: Date.now },
});

const cartItemSchema = new mongoose.Schema({
  cart: { type: mongoose.Schema.Types.ObjectId, ref: 'Cart', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
});

const Promotion = mongoose.model('Promotion', promotionSchema);
const Collection = mongoose.model('Collection', collectionSchema);
const Product = mongoose.model('Product', productSchema);
const Customer = mongoose.model('Customer', customerSchema);
const Seller = mongoose.model('Seller', sellerSchema);
const Order = mongoose.model('Order', orderSchema);
const OrderItem = mongoose.model('OrderItem', orderItemSchema);
const Address = mongoose.model('Address', addressSchema);
const Cart = mongoose.model('Cart', cartSchema);
const CartItem = mongoose.model('CartItem', cartItemSchema);

module.exports = {
  Promotion,
  Collection,
  Product,
  Customer,
  Seller,
  Order,
  OrderItem,
  Address,
  Cart,
  CartItem,
};
