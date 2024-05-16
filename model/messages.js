const mongoose = require("mongoose");

const MessagesSchema = new mongoose.Schema(
  {
    businessDir: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "BusinessDir"
      }],
    message: {
      type: String,
      required: true
    }
},
{ timestamps: true }
);

module.exports  = mongoose.model("Messages", MessagesSchema);
