const mongoose = require('mongoose');

const adTrackingSchema = new mongoose.Schema({
    adId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Ads"
    },
    type: { 
        type: String, 
        enum: ['impression', 'click'] 
    },
    ip: String,
    country: String,
    city: String,
    timestamp: { type: Date, default: Date.now },
});

const AdTracking = mongoose.model('AdTracking', adTrackingSchema);

module.exports = AdTracking;
