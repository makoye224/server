const mongoose = require("mongoose")

const sellerSchema = mongoose.Schema({
    name: {
        type: String, 
        required: [true, "please add a name"]
    }, 
    email: {
        type: String, 
        required: [true, "please add an email"],
        unique: true
    }, 
    password: {
        type: String, 
        required: [true, "please add a password"]
    },
    businessType: {
        type: String, 
        required: [true, "please add type of business"]
    },
    businessName: {
        type: String, 
        required: [true, "please add a name of your business"]
    },
}, 
{
    timestamps: true
})

module.exports = mongoose.model("Seller", sellerSchema)