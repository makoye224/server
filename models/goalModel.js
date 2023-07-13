const mongoose = require('mongoose')
const goalSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User"
        },
        name: {
            type: String, 
            required: [true, "please add a name value"],
        },
        price:{
            type: String, 
            required: [true, "please add a price value"],
        },
        description:{
            type: String, 
            required: [true, "please add a description value"],
        },
        photo: {
            type: String,
            required: true,
            
        },
        video: {
            type: String,
            required: false,
            
        },
    }, 
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('Goal', goalSchema)
