import { Likes } from "../models/likes.model.js";
import { Subscription } from "../models/subscription.model.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiErrors } from "../utils/apiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";


//getChannelStats i.e Views,Likes,Subscribers
//getChannelVidos totalVideos,

const getChannelStats = asyncHandler(async(req,res)=>{
    const channelId = req.user?._id
    if(!channelId){
        throw new ApiErrors(400,"Channel id needed")
    }
    const channel = await User.findOne({_id:channelId})
    if(!channel){
        throw new ApiErrors(400,"Something Went Wrong While fetching the Channel Info")
    }
    const subscribers =await Subscription.find({subscriber:channelId})
    if(!subscribers){
        throw new ApiErrors(500,"Something went wrong while fetching the Subscribers")
    }
    
    const likes = await Likes.find({likedBy:channelId})
    if(!likes){
        throw new ApiErrors(500,"Something went wrong while Getting Likes")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,{
            channel,
            subscribers,
            likes
        },"Channel Stats Fetched Successfully")
    )

})

const getChannelVideos = asyncHandler(async(req,res)=>{
    const videos = await Video.find({owner:req.user?._id})
    if(!videos){
        throw new ApiErrors(500,"Something went Wrong While getting the Videos")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,videos,"Videos Fetched Successfully")
    )
})

export {
    getChannelStats,
    getChannelVideos
}