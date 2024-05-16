const mongoose = require("mongoose");

const AdsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    totalAmountPaid: {
      type: Number,
      required: true
    },
    paymentSplit: [{
      date: {
        type: Date,
        required: true
      },
      amount: {
        type: Number,
        required: true
      }
    }],
    city: {
      type: String
    },
    country: {
      type: String
    },
    keywords: {
      type: String
    },
    categories: {
      type: String
    },
    duration: {
      type: Number,
      required: true
    },
    budget: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ["active", "paused", "expired"],
      default: "active"
    },
    businessDir: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BusinessDir"
    },
    posts: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Posts"
    }
  },
  { timestamps: true }
);

AdsSchema.pre("save", function (next) {
  if (!this.isModified("startDate") && !this.isModified("endDate") && !this.isModified("budget")) {
    return next();
  }

  const { startDate, endDate, budget, duration } = this;

  const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)); // Calculate total days of the ad

  const dailyBudget = budget / duration; // Calculate daily budget

  const paymentSplit = []; // Initialize payment split array

  for (let i = 0; i < duration; i++) {
    const currentDate = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000); // Calculate current date

    const amountForDay = dailyBudget; // Calculate amount for the current day

    paymentSplit.push({ date: currentDate, amount: amountForDay }); // Add current date and amount to payment split array
  }

  this.paymentSplit = paymentSplit; // Set payment split array to the ad document

  next();
});

const Ads = mongoose.model("Ads", AdsSchema);

module.exports = Ads;
