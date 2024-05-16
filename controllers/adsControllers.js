const Ads   = require("../model/ads");
const asyncErrorHandler = require("./../utils/asyncErrorHandler");


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