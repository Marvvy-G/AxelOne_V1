const User = require("../model/user");
const jwt               = require("jsonwebtoken");
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const CustomError = require("../utils/CustomError");
const utils             = require("util");
const axios = require("axios");
const path  = require("path")


const sendEmail = require("./../utils/email")
const signToken = id => {
    return jwt.sign({
           id
           },
           process.env.JWT_SEC,
           {expiresIn: process.env.LOGIN_EXPIRES});
}


//SIGNUP/REGISTER User
exports.signup = async (req, res, next) => {
   try{ const newUser = await User.create(req.body);

    res.status(201).json({
        status: "success",

        data: {
            newUser
        }
    })
    
   } catch (err){
    console.log(err)
   } next()
}


//Get User - Sign up Page Controller
exports.signupPage     =     (req, res, next) => {
    res.status(201).json("signup");
    next();
   };

//Get Login page controller
exports.loginPage     =     (req, res, next) => {
    res.status(201).json("login");
    next();
   };


//LOGIN User
exports.login            =    asyncErrorHandler (async (req, res, next) => {
    const {email, password} =    req.body;
       if (!email || !password){
           const error = new CustomError("Please provide email and password", 400);
           return next(error);
       }
   
       const user = await User.findOne({email}).select("+password");
   
       //const isMatch = await user.comparePasswordInDb(password, user.password);
   
      //Check if user exist and password matches
      if(!user || !(await user.comparePasswordInDb(password, user.password))){
       const error = new CustomError("Incorrect Email or Password", 400);
       return next(error);
      }
   
       const token = signToken(
           user._id
       )
       res.status(201).json({
        status: "success",
        token,
        data: {
            User
        }
    })
    console.log(token)
       next();
   })
   
//Direct Timeline edit controller
exports.timelineEdit = asyncErrorHandler(async (req, res, next) => {
    if (!req.User) { // Ensure 'req.user' is correctly referenced
        return res.status(401).json({ status: "error", message: "Unauthorized" });
    }

    try {
        const userId = req.User._id; // Assuming 'req.user' contains the authenticated user's information
        const updatedUser = await User.findByIdAndUpdate(userId, req.body, { new: true, runValidators: true });

        if (!updatedUser) {
            return res.status(404).json({ status: "error", message: "User not found" });
        }

        return res.status(200).json({ status: "success", data: { updatedUser } });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: "Internal server error" });
    }
});


//Edit direct timeline url get page
exports.timelineEditPage = asyncErrorHandler(async(req, res, next) => {
    if(!req.User) {
        return res.status(401).json({status: "error", message: "unauthorized"})
    }
    const user = await User.findById(req.params.id)
    res.status(201).json({message: "Edit Your profile", user});
    next();
})

//Direct timeline
exports.timeline = asyncErrorHandler(async(req, res, next) => {
    if(!req.User) {
        return res.status(401).json({status: "error", message: "unauthorized"})
    }

    const user = await User.findById(req.params.id).populate("newPost comments")
    res.status(201).json({data:{user}, message:"Welcome to your timeline"});
    next();
})

//forgort password
exports.forgotPassword = asyncErrorHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
  
    if (!user) {
      const error = new CustomError('We could not find your account', 404);
      return next(error);
    }
  
    const resetToken = user.createResetPasswordToken();
    await user.save({ validateBeforeSave: false });
  
    const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/resetPassword/${resetToken}`;
    const message = `You have requested to reset your password. Please use the link below to reset your password.\nPlease Note: This link expires in 8 minutes.\n\n${resetUrl}`;
  
    try {
      await sendEmail({
        email: user.email,
        subject: 'You Have Requested to Change your Password',
        message: message,
      });
  
      res.status(200).json({
        status: 'success',
        message: 'Password reset link sent to user email',
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
  
      console.error('Error sending email:', err);
      return next(new CustomError('There was an error sending password reset email, please try again later', 500));
    }
  });
  

exports.resetPassword = (req, res, next) => {

}

//middleware for authenticating users
const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({status: 'error', message: 'Unauthorized'})
    }

    const token = authHeader.split(' ')[1];

    try{
        //verify token

        const decoded = jwt.verify(token, process.env.JWT_SEC);

        //fetch user details from laravel api
        const response = await axios.get(`https://laravel.com/endpoint`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        req.user = response.data;
        next();
    } catch (error) {
        console.error(error);
        res.status(401).json({status: 'error', message: 'Unauthorized'})
    }
}

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads/');
//     },
//     filename: (req, file, cb) => {
//         cb(null, `${Date.now()}_${file.originalname}`);
//     }
// });

// const fileFilter = (req, file, cb) => {
//     if (file.mimetype.startsWith('image/')) {
//         cb(null, true);
//     } else {
//         cb(new Error('Not an image! Please upload an image.'), false);
//     }
// };

// const upload = multer({
//     storage: storage,
//     fileFilter: fileFilter
// });

//middleware for protecting routes
exports.protect = asyncErrorHandler (async (req, res, next) => {
    //1. Read the token and check if it exist
        const testToken = req.headers.authorization;
            let token;
        if (testToken && testToken.startsWith('bearer')){
            token = testToken.split(' ')[1];
        }
        if(!token) {
            next(new CustomError("You are not logged in", 401))
        }
    //2. Validate the token
        const decodedToken = await utils.promisify(jwt.verify)(token, process.env.JWT_SEC);
        console.log(decodedToken);
    //3. If the User exist
        const user = await User.findById(decodedToken.id);
        if (!user){
            const error = new CustomError("The User with the given token does not exist", 401);
            next(error);
        }

    //     const isPasswordChanged = await User.isPasswordChanged(decodedToken.iat)
    // //4. If the User changed password after the token was issued
    //    if (isPasswordChanged){
    //     const error = new CustomError("The password has been changed recently. Please login again", 400)
    //     return next(error)
    //    }
    //5. Allow User to access route
       req.User = user;
       next();
})

//middleware for restricting User users based on their roles
exports.restrict = (...userType) => {
    return(req, res, next) => {
        if (!userType.includes(req.User.userType)){
            const error = new CustomError("You do not have permission to perform this action", 403);
            next(error);
        }
        next();
    }
}
