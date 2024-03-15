import { Likes } from "../models/likes.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiErrors } from "../utils/apiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";

//toggleVideoLike
//toggleCommentLike
//toggleTweetLike
//getLikedVideos

const toggleVideoLike = asyncHandler(async(req,res)=>{
    //First check for the given id in the db if it is there delete else create
    const {videoId} = req.params
    let response;
    if(!videoId){
        throw new ApiErrors(400,"Didn't get the VideoId")
    }
    const prevlike = await Likes.findOne({video:videoId,likedBy:req.user?._id})
    // console.log(prevlike);
    let like;
    if(prevlike === null){
        like = await Likes.create({
            video:videoId,
            likedBy:req.user?._id,
        })
        if(!like){
            throw new ApiErrors(500,"Something Went Wrong")
        }
        response = "Liked the Video"

    } else {
        like = await Likes.findByIdAndDelete(prevlike._id);
        if(!like){
            throw new ApiErrors(500,"Something Went wrong")
        }
        response = "Disliked the Video"
    }
    // console.log(like);
    return res
    .status(200)
    .json(
        new ApiResponse(200,like,response)
    )
})

const toggleCommentLike = asyncHandler(async(req,res)=>{
    const {commentId} = req.params
    let response;
    let like;
    if(!commentId){
        throw new ApiErrors(400,"Comment Id needed")
    }
    const prevComment = await Likes.findOne({comment:commentId,likedBy:req.user?._id})
    if (prevComment === null) {
        like = await Likes.create({
            comment:commentId,
            likedBy:req.user?._id
        })
        if(!like){
            throw new ApiErrors(500,"Something went wrong (LIKE)")
        }
        response = "Liked the Comment"
    } else {
        like = await Likes.findByIdAndDelete(prevComment._id)
        if(!like){
            throw new ApiErrors(500,"Something went wrong (DISLIKE)")
        }
        response = "Disliked the comment"
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,like,response)
    )

})

const toggleTweetLike = asyncHandler(async(req,res)=>{
    const {tweetId} = req.params
    let like,response;
    if(!tweetId){
        throw new ApiErrors(400,"Tweet Id needed Bro")
    }
    const prevTweet = await Likes.findOne({tweet:tweetId,likedBy:req.user?._id})
    if (prevTweet === null) {
        like = await Likes.create({
            tweet:tweetId,
            likedBy:req.user?._id
        })
        if(!like){
            throw new ApiErrors(500,"Something went wrong (LIKE)")
        }
        response = "Liked the Tweet"
    } else {
        like = await Likes.findByIdAndDelete(prevTweet._id)
        if(!like){
            throw new ApiErrors(500,"Something went wrong (DISLIKE)")
        }
        response = "Disliked the Tweet"
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,like,response)
    )
})

//needs to be fixed as it gets all the likes not just of videos
const getLikedVideos = asyncHandler(async(req,res)=>{
    //we will have to use aggregation pipeline
    const videos = await Likes.aggregate([
        {
            $match:{
                likedBy:req.user?._id
            }
        },
        {
            $project:{
                video:1
            }
        }
    ])
    if(!videos){
        throw new ApiErrors(500,"Something went wrong while getting Videos")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,videos,"Fetched all the Videos")
    )
})

export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos
}