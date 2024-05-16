const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({

    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true,
        validate: [validator.isEmail, "Please enter a valid email"]
    },
    password: {
        type: String,
        require: true,
        minlength: 8,
        select: false
    },
    confirmPassword: {
        type: String,
        validate: {
            //This validator will only work when registering a new user
            validator: function(val){
               return val == this.password;
            },
            message: 'Password & Confirm Password does not match'
        }
    },
    passwordChangedAt: Date,
    userType:[ {
        type: String,
        enum: ['user', 'business', 'admin' ],
        default: 'user'
      }],
    address:{
        type: String,
    },
    description:{
        type: String,
    },
    newPost: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
      }],
      comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
      }],
    listings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Listings"
    }],
     businessName: {
        type: String
    },
    businessType: {
        type: String
    },
    businessEmail: {
        type: String,
    },
    businessAddress: {
        type: String,
    },
}

)


UserSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();

//encrypt the password before saving it
   this.password = await bcrypt.hash(this.password, 12);

   this.confirmPassword = undefined;
    next();
})

//COMPARE ENCRYPTED PASSWORD WITH PASSWORD IN THE DATABASE
UserSchema.methods.comparePasswordInDb = async function(password, passwordDb){
    return  await bcrypt.compare(password, passwordDb);

}

//CHECK IF PASSWORD IS CHANGED && DO NOT ALLOW A USER WHO HAS CHANGED THEIR PASSWORD TO ACCESS THE ROUTE
UserSchema.methods.isPasswordChanged = async function (JWTTimestamp){
    if (this.passwordChangedAt){
        const passwordChangedTimestamp = parseInt(this.passwordChangedAt.getTime()/1000, 10);
        console.log(passwordChangedTimestamp, JWTTimestamp);

      return  JWTTimestamp < passwordChangedTimestamp;
    }
    return false;
}


module.exports = mongoose.model("User", UserSchema);

 