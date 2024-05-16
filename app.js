const express = require ("express"),
      dotenv  = require("dotenv"),
      port = process.env.PORT || 8080,
      mongoose   = require("mongoose")
      dotenv.config()
const app = express();


//ROUTES
const adsRoute = require("./routes/adsRoute");
const authRoute = require("./routes/authRoute");
const postRoute = require("./routes/postRoute");

//DATABASE
// mongoose.connect("mongodb+srv://bellsehr:password1234@bellsehr.bwuj4eh.mongodb.net/?retryWrites=true&w=majority");

mongoose.connect("mongodb://localhost/prettyAds");

app.use(express.json());
app.use("/api/ads", adsRoute);
app.use("/api/auth", authRoute);
app.use("/api/post", postRoute);

app.listen(port, function(){
    console.log("AxelOne_V1_Ads");
    });