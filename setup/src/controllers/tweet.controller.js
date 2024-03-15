import { Tweet } from "../models/tweet.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiErrors } from "../utils/apiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";

//Create tweet
//getuserTweet
//updateTweet
//deleteTweet
const createTweet = asyncHandler(async(req,res)=>{
    const {content} = req.body

    if(!content){
        throw new ApiErrors(401,"Tweet Contents required")
    }
   
    const tweet = await Tweet.create({
        content,
        owner:req.user?._id
    })

    if(!tweet){
        throw new ApiErrors(500,"Something Went Wrong while creating tweet")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,tweet,"tweet created successfully")
    )
})

const getUserTweet = asyncHandler(async(req,res)=>{

    const tweet = await Tweet.findOne({owner:req.user?._id})
    console.log(tweet);
    if(!tweet){
        throw new ApiErrors(401,"Can't get tweets")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,tweet,"tweets fetched Successfully")
    )

})

const updateTweet = asyncHandler(async(req,res)=>{
    const {content} = req.body
    if(!content){
        throw new ApiErrors(401,"Content Required")
    }
    console.log(req.user._id);
    const tweetId = await Tweet.findOne({owner:req.user?._id})
    const tweet = await Tweet.findByIdAndUpdate(
        tweetId._id,
        {
            $set:{
                content
            }
        },
        {
            new:true
        }
    )
    if(!tweet){
        throw new ApiErrors(500,"Something went Wrong while updating tweets")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,tweet,"tweets Updated Successfully")
    )
})

const deleteTweet = asyncHandler(async(req,res)=>{
    const tweet = await Tweet.findOneAndDelete(
        {owner:req.user?._id}
    )
    if(!tweet){
        throw new ApiErrors(500,"Something Went Wrong while deleting tweet")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,tweet,"tweet deleted Successfully")
    )
})

export {
    createTweet,
    getUserTweet,
    updateTweet,
    deleteTweet
}