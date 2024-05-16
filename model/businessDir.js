const mongoose = require("mongoose");
const validator = require("validator");

const BusinessSchema = new mongoose.Schema({

    businessName: {
        type: String,
        required: true
    },
    businessType: {
        type: String,
        required: true
    },
    businessEmail: {
        type: String,
    },
    email:{
        type: String,
        required: true,
        unique: true,
        validate: [validator.isEmail, "Please enter a valid email"]
    },
    address:{
        type: String,
    },
    description:{
        type: String,
    },
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Posts"
      }],
    user: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }],
    
}

)



module.exports = mongoose.model("Business", BusinessSchema);

 