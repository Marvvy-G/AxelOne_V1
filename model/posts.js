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
    author:{
      type: String,
      required: true
    },
    organizationId: {
      type: String,
      required: true
    }
},
{ timestamps: true }
);

module.exports  = mongoose.model("Post", PostSchema);
