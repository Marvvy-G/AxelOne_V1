const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const UserSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        unique: true
    },
    profile:{
        firstName: {
            type: String,
            required: true
        },
        lastName: {
            type: String,
            required: true
        },
        bio: {
            type: String,
        },
        contact: {
            
            phone: {
                type: String,
            }
        },
        address: {
            street: {
                type: String
            },
            city: {
                type: String
            },
            state: {
                type: String
            },
            country: {
                type: String
            },
            zip: {
                type: String
            }
        }

    },
    
    settings: {
        theme: {
            type: String,
            enum:['light', 'dark'],
            default: 'light'
        },
        language: {
            type: String,
            default: 'en'
        },
        privacy: {
            profileVisibility: {
                type: String,
                enum: ['public', 'private'],
                default: 'public'
            },
            searchVisibility: {
                type: Boolean,
                default: true
            }
        },
    notifications: {
        emailNotifications: {
            type: Boolean,
            default: true
        },
        smsNotifications: {
            type: Boolean,
            default: false
        },
        pushNotifications: {
            type: Boolean,
            default: true
        }
    }
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
    passwordResetToken: String,
    passwordResetTokenExpire: Date

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

UserSchema.methods.createResetPasswordToken = function(){
    const resetToken = crypto.randomBytes (32).toString('hex');

    this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest('hex');
    this.passwordResetTokenExpire = Date.now() + 10 * 60 * 1000;
    console.log(resetToken, this.passwordResetToken)
    return  resetToken;
}

module.exports = mongoose.model("User", UserSchema);

 