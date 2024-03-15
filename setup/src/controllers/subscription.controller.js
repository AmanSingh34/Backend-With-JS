import { Subscription } from "../models/subscription.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiErrors } from "../utils/apiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";

//toggleSubscription
//getuserchannelSubscription i.e channel ko kitne logo ne subscribe kar rakha hai uska count
//getSubscribedChannels       i.e maine kitne ko subscribe kara hai

const toggleSubscription = asyncHandler(async(req,res)=>{
    const {channelId} = req.params
    //needs to fix the channel id to directly get the channel id to be subscribed
    //There's one more check can  be added that if the channel given exist or not
    if(!channelId){
        throw new ApiErrors(401,"channel Id not found")
    }
    const channel = await Subscription.findOne({channel:channelId})
    if(channel){
        throw new ApiErrors(401,"You Already Subscribed to this channel")
        //Later add this functionality as to Unsubscribe the channel
    }

    const subscribe = await Subscription.create({
        subscriber:req.user?._id,
        channel:channelId
    })

    if(!subscribe){
        throw new ApiErrors(500,"Something went Wrong While Subscribing")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,subscribe,"Channel Subscribed Successfully")
    )
})

const getUserChannelSubscription = asyncHandler(async(req,res)=>{
    // const {channelId} = req.params
    // //Will have to write the pipelines (Aggregate) to get the subscriber count
    // if(!channelId){
    //     throw new ApiErrors(401,"ChannelId Required")
    // }
    const Subscribers = await Subscription.find({channel:req.user?._id})
    console.log(Subscribers);
    if(!Subscribers){
        throw new ApiErrors(500,"Something went wrong while fetching Subscribers")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,Subscribers.length,"Subscribers fetched Successfully")
    )
})

const getSubscribedChannels = asyncHandler(async (req,res)=>{
    const channels = await Subscription.find({subscriber:req.user?._id})
    if(!channels){
        throw new ApiErrors(500,"Something went wrong while fetching channels")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,channels.length,"Channels fetched Successfully")
    )
})

export {
    toggleSubscription,
    getUserChannelSubscription,
    getSubscribedChannels
}