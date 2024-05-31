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
    businessCategory: {
      type: String,
      enum: [
        'Real Estate Agencies', 'Law Firms', 'Accounting Firms', 'Financial Advisors', 'Management Consultants', 
        'Insurance Brokers', 'Architectural Firms', 'Engineering Consultants', 'Private Medical Practices', 
        'Dental Clinics', 'Optometrists', 'Chiropractors', 'Physical Therapy Clinics', 'Mental Health Counselors', 
        'Specialized Clinics', 'Private Tutoring Services', 'Test Prep Centers', 'Professional Certification Programs', 
        'Vocational Schools', 'Language Schools', 'Luxury Car Dealerships', 'High-End Home Improvement Services', 
        'Landscape Design Firms', 'Custom Home Builders', 'Interior Design Firms', 'Pool Installation and Maintenance', 
        'Premium Cleaning Services', 'IT Consulting Firms', 'Software Development Companies', 'Managed IT Services', 
        'Cybersecurity Firms', 'Web Design and Development Agencies', 'Boutique Hotels', 'Luxury Travel Agencies', 
        'Event Planning Services', 'Wedding Planning Services', 'Vacation Rental Management Companies', 'Mortgage Brokers', 
        'Investment Firms', 'Private Equity Firms', 'Wealth Management Firms', 'Luxury Goods Retailers', 
        'High-End Fashion Boutiques', 'Specialty Electronics Stores', 'Fine Jewelry Stores', 'High-End Gyms and Fitness Studios', 
        'Personal Training Services', 'Spa and Wellness Centers', 'Cosmetic Surgery Clinics', 'Nutrition and Diet Consulting Services', 
        'Commercial Real Estate Brokers', 'Business Consulting Firms', 'Corporate Law Firms', 'Marketing and Advertising Agencies', 
        'Recruitment and Staffing Agencies', 'Luxury Auto Dealerships', 'Custom Car Shops', 'Auto Leasing Companies', 
        'Private Security Firms', 'Exclusive Country Clubs'
          ]
    },
    targetLocations: [ 
      {
        targetCountry: String,
      },
      {
        targetCity: String
      }
    ],
    externalUrl: {
      type: String
    },
    impressions: { 
      type: Number, 
      default: 0 
    },
    clicks: { 
      type: Number, 
      default: 0 
    },
    leads: { 
      type: Number, 
      default: 0 
    },
    acquisitions: { 
      type: Number, 
      default: 0 
    },
    costPerMile: { 
      type: Number,
      enum: [0.5, 1, 2], 
      default: 0.5
    },
    costPerClick: { 
      type: Number,
      enum: [0.5, 1, 2], 
      default: 0.5
    },
    costPerLead: { 
      type: Number,
      enum: [0.5, 1, 2], 
      default: 0.5
    },
    costPerAcquisition: { 
      type: Number,
      enum: [0.5, 1, 2], 
      default: 0.5
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
    redirectUrl: {
      type: String
    },
    dailySpent: [{
      date: {
        type: Date,
        required: true
      },
      amount: {
        type: Number,
        default: 0
      }
    }],
    remainingBudget: {
      type: Number,
      default: function() {
        return this.budget;
      }
    }
  },
  { timestamps: true }
);


// Pre-save middleware to validate and parse dates
AdsSchema.pre("save", function (next) {
  if (!this.isModified("startDate") && !this.isModified("endDate")) {
    return next();
  }

  // Ensure startDate and endDate are valid Date objects
  const startDate = new Date(this.startDate);
  const endDate = new Date(this.endDate);

  // Check if startDate and endDate are valid dates
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return next(new Error("Invalid startDate or endDate"));
  }

  this.startDate = startDate;
  this.endDate = endDate;

  next();
});

// Pre-save middleware to calculate payment split
AdsSchema.pre("save", function (next) {
  if (!this.isModified("startDate") && !this.isModified("endDate") && !this.isModified("budget")) {
    return next();
  }

  const { startDate, endDate, budget, duration } = this;

  const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)); // Calculate total days of the ad

  
  const dailyBudget = budget / totalDays; // Calculate daily budget

  const paymentSplit = []; // Initialize payment split array
  const dailySpent = []; // Initialize daily spent array

  for (let i = 0; i < totalDays; i++) {
    const currentDate = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000); // Calculate current date

    paymentSplit.push({ date: currentDate, amount: dailyBudget }); // Add current date and amount to payment split array
    dailySpent.push({ date: currentDate, amount: 0 }); // Initialize daily spent to 0
  }

  this.paymentSplit = paymentSplit; // Set payment split array to the ad document
  this.dailySpent = dailySpent; // Set daily spent array to the ad document
  this.remainingBudget = budget; // Initialize remaining budget

  next();
});

const Ads = mongoose.model("Ads", AdsSchema);

module.exports = Ads;
