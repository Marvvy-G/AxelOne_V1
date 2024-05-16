const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
    },
    media:[{
      image: {
      type: String
    },
  video: {
    type: String
  }}
  ],
    content: {
      type: String
    },
    comments:[{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment"
    }],
    author: [{
      type:mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }]
},
{ timestamps: true }
);

module.exports  = mongoose.model("Post", PostSchema);
