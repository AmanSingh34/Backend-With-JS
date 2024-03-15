import { ApiErrors } from "../utils/apiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Comment } from "../models/comments.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

//Will later also add comments for the tweets
//getVideoComments
//addComment
//updateComment
//deleteComment
const getVideoComments = asyncHandler(async(req,res)=>{
    const {videoId} = req.params
    if(!videoId){
        throw new ApiErrors(400,"Didn;t get the videoId")
    }
    const comment = await Comment.find({video:videoId}).select("content")
    // console.log(comment);
    if(!comment){
        throw new ApiErrors(500,"Something went wrong while Getting Comments")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,comment,"Got all the comments"))

})

const addComment = asyncHandler(async(req,res)=>{
    const {content} = req.body
    const {videoId} = req.params
    if(!videoId){
        throw new ApiErrors(400,"Didn't get the VideoId")
    }
    if(!content){
        throw new ApiErrors(400,"Didn't get the Content")
    }

    const comment = await Comment.create({
        content,
        video:videoId,
        owner:req.user?._id
    })
    if(!comment){
        throw new ApiErrors(500,"Something went wrong while adding comment")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,comment,"Comment Added Successfully")
    )
})

const updateComment = asyncHandler(async(req,res)=>{
    const {commentId}  = req.params
    const {content} = req.body
    if(!commentId){
        throw new ApiErrors(400,"Didn't get the Comment ID")
    }
    if(!content){
        throw new ApiErrors(400,"Content Needed")
    }
    const comment = await Comment.findByIdAndUpdate(
        commentId,
        {
            content
        },
        {
            new:true
        }
    )
    if(!comment){
        throw new ApiErrors(500,"Something went wrong while updating comment")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,comment,"Comment Updated Successfully")
    )

})

const deleteComment = asyncHandler(async(req,res)=>{
    const {commentId} = req.params
    if(!commentId){
        throw new ApiErrors(400,"Didn;t get the commentID")
    }

    const comment = await Comment.findByIdAndDelete(commentId)
    if(!comment){
        throw new ApiErrors(500,"Something went wrong while deleting Comment")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,comment,"Comment Deleted Successfullly")
    )

})


export {
    addComment,
    getVideoComments,
    updateComment,
    deleteComment
}