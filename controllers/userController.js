const User = require("../model/user");
const jwt               = require("jsonwebtoken");
const business = require ("../model/businessDir");
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const CustomError = require("../utils/CustomError");
const utils             = require("util");
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
