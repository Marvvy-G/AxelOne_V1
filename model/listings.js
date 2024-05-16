const mongoose = require("mongoose");

const ListingsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    post: {
      type: Date,
      required: true
    }
},
{ timestamps: true }
);

module.exports  = mongoose.model("Listings", ListingsSchema);
