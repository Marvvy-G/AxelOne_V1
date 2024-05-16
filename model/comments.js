const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    author:[ {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }],
    post:[ {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        required: true
    }],
    comments:{
      type: String,
      required: true
    }
},
{ timestamps: true }
);

module.exports  = mongoose.model("Comment", CommentSchema);
