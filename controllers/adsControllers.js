const Ads   = require("../model/ads");
const asyncErrorHandler = require("./../utils/asyncErrorHandler");

const AdTracking = require("../model/adTracking");

const axios = require("axios");

const geojsApiUrl = 'https://get.geojs.io/v1/ip/geo/';

let adsRotation = {}; // In-memory storage for rotation index


exports.startNewAd  = async (req, res, next) => {
    try{const newAd     =await Ads.create(req.body);

    //calculate payment split
    res.status(201).json({
        status: "success",
        data: 
        {
            newAd
        }
    }) 
} catch (err){
    console.log(err)
}
    next()
}


// const getGeoData = async (ip) => {
//     try {
//         const response = await axios.get(`https://get.geojs.io/v1/ip/geo/${ip}.json`);
//         return response.data;
//     } catch (error) {
//         console.error('Error fetching geolocation data:', error);
//         return null;
//     }
// };

exports.getAdsByLocation = async (req, res) => {
    try {
        const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const geoResponse = await axios.get(`${geojsApiUrl}${clientIp}.json`);
        const geoData = geoResponse.data;
        const { country, city } = geoData;

        const ads = await Ads.find(
            {
            targetLocations: {
                $elemMatch: {
                    targetCountry: country,
                    targetCity: city
                }
            }
            // Add any additional criteria here, such as business category
        }
        );

        if (ads.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'No ads available for your location'
            });
        }

        const rotationKey = `${country}-${city}`;
        if (!adsRotation[rotationKey]) {
            adsRotation[rotationKey] = 0;
        }

        const currentAdIndex = adsRotation[rotationKey];
        const currentAd = ads[currentAdIndex];

        adsRotation[rotationKey] = (currentAdIndex + 1) % ads.length;

        // Record an impression
        await AdTracking.create({
            adId: currentAd._id,
            type: 'impression',
            ip: clientIp,
            country,
            city,
        });

        // Update impressions count and budget
        currentAd.impressions += 1;
        const today = new Date().setHours(0, 0, 0, 0);
        const dailyEntry = currentAd.dailySpent.find(entry => entry.date.getTime() === today);
        const costPerImpression = currentAd.costPerMile / 1000;

        if (dailyEntry) {
            dailyEntry.amount += costPerImpression;
        } else {
            currentAd.dailySpent.push({ date: new Date(today), amount: costPerImpression });
        }

        currentAd.remainingBudget -= costPerImpression;

        if (currentAd.remainingBudget < 0) {
            currentAd.status = 'expired';
            currentAd.remainingBudget = 0;
        }

        await currentAd.save();

        res.status(200).json({
            status: 'success',
            data: currentAd
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
};


// app.get('/ad-click/:adId' 
exports.click = async (req, res) => {
    try {
        const { adId } = req.params;
        const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const geoResponse = await axios.get(`https://get.geojs.io/v1/ip/geo/${clientIp}.json`);
        const geoData = geoResponse.data;
        const { country, city } = geoData;


        // if (!mongoose.Types.ObjectId.isValid(adId)) {
        //     return res.status(400).json({
        //         status: 'error',
        //         message: 'Invalid ad ID'
        //     });
        // }

        const ad = await Ads.findById(adId);
    if (!ad) {
      return res.status(404).json({
        status: 'error',
        message: 'Ad not found'
      });
    }

        // Record a click
        await AdTracking.create({
            adId,
            type: 'click',
            ip: clientIp,
            country,
            city,
        });

        

        // await Ads.findByIdAndUpdate(adId, { $inc: { clicks: 1 } });

    // Update clicks count and budget
    ad.clicks += 1;
    const today = new Date().setHours(0, 0, 0, 0);
    const dailyEntry = ad.dailySpent.find(entry => entry.date.getTime() === today);
    const costPerClick = ad.costPerClick;

    if (dailyEntry) {
      dailyEntry.amount += costPerClick;
    } else {
      ad.dailySpent.push({ date: new Date(today), amount: costPerClick });
    }

    ad.remainingBudget -= costPerClick;

    if (ad.remainingBudget < 0) {
      ad.status = 'expired';
      ad.remainingBudget = 0;
    }

    await ad.save();

    // Redirect to external URL if specified
    // if (ad.externalUrl) {
    //   return res.redirect(ad.externalUrl);
    // }

    res.status(200).json({
      status: 'success',
      data: ad
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};
        // Fetch the ad to get the external URL
        // const ad = await Ads.findById(adId);
        // if (!ad) {
        //     return res.status(404).json({
        //         status: 'error',
        //         message: 'Ad not found'
//             });
//         }

//         // Redirect to the external URL
//         // res.redirect(ad.redirectUrl);
//         res.status(200).json({
//             status: "success",
//             message: "one click recorded"
//         })
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({
//             status: 'error',
//             message: 'Internal server error'
//         });
//     }
    
// };

const calculateCostsAndMetrics = (ad) => {
    const impressions = ad.impressions;
    const clicks = ad.clicks;
    const leads = ad.leads;
    const acquisitions = ad.acquisitions;

    const ctr = clicks / impressions;
    const cpm = (impressions / 1000) * ad.costPerMille;
    const cpc = clicks * ad.costPerClick;
    const cpl = leads * ad.costPerLead;
    const cpa = acquisitions * ad.costPerAcquisition;

    return {
        ctr,
        cpm,
        cpc,
        cpl,
        cpa,
    };
};

// app.get('/ad-stats/:adId', 

exports.stats = async (req, res) => {
    try {
        const { adId } = req.params;
        const ad = await Ads.findById(adId);

        if (!ad) {
            return res.status(404).json({
                status: 'error',
                message: 'Ad not found'
            });
        }

        const metrics = calculateCostsAndMetrics(ad);

        res.status(200).json({
            status: 'success',
            data: {
                ad,
                metrics
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
};

// app.get('/admin/ad-stats',
exports.admin = async (req, res) => {
    try {
        const ads = await Ads.find();
        const adsWithMetrics = ads.map(ad => ({
            ad,
            metrics: calculateCostsAndMetrics(ad)
        }));

        res.status(200).json({
            status: 'success',
            data: adsWithMetrics
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
};

//edit ad
exports.updateAd = async(req, res, next) => {
   try{ const updatedAd = await Ads.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
    res.status(200).json({status: "success",data:{updatedAd}})
} catch (err){
    res.status(404).json({status: err})
}
};

//delete ad
exports.deleteAd = async(req, res, next) => {
   try{ await Ads.findByIdAndDelete(req.params.id)
    res.status(200).json({
        status: "Ads has been successfully deleted"
    })
} catch (err){
    console.log({status: "Delete failed"})
}
}

//pause an ad
exports.pauseAd = async(req, res, next) => {
   try{ const pausedAd = await Ads.findByIdAndUpdate(req.params.id, {status: "paused"}, {new: true})
    res.status(200).json({
        status: "Ad has been successfully paused",
        data: {
             pausedAd
        }
    })
} catch (err){
    res.status(401).json({status: "Pause successful"})

}
}