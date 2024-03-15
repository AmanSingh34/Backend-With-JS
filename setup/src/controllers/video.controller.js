import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiErrors } from "../utils/apiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getResources, uploadOnCloudinary } from "../utils/cloudinary.js";


//getAllVideo
//PublishAVideo
//getVideoById
//updateVideo
//deleteVideo
//togglePublishStatus
const getAllVideo = asyncHandler(async (req,res)=>{
    const {page = 1,limit = 10,query,sortBy,sortType} = req.query
    //for now we will handle only to get the videos based on the query

    const queriedVideos = await Video.aggregate([
        {
            $match:{
                title:query
            }
        }
    ])
    console.log(queriedVideos);

    const videos = await Video.aggregate([  //To isse aa gaya bande ke sare videos
        {
            $match:{
                owner: new mongoose.Types.ObjectId(req.user?._id)
            }
        }
    ])
    // console.log(videos);
    if(!videos){
        throw new ApiErrors(500,"Something went wrong while fetching Videos")
    }
    //Ab apan Public Vaste sare videos dhundhega
    if(query){
        return res
        .status(200)
        .json(
            new ApiResponse(200,queriedVideos,"Query Fetched")
        )
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,videos,"Videos Fetched Succesfully")
    )
    

})

const publishAVideo = asyncHandler(async(req,res)=>{
    const {title,description} = req.body
    if([title,description].some((field) => field?.trim() ==="")){
        throw new ApiErrors(400,"Title & Description are required")
    }
    const videoFileLocalPath = req.files?.videofile[0].path
    if(!videoFileLocalPath){
        throw new ApiErrors(400,"Video File required")
    }
    const thumbnailLocalpath = req.files.thumbnail[0].path
    if(!thumbnailLocalpath){
        throw new ApiErrors(400,"Thumbnail File required")
    }

    const VideoFile = await uploadOnCloudinary(videoFileLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalpath)
    if(!VideoFile || !thumbnail){
        throw new ApiErrors(500,"something went wrong while uploading files")
    }
    const publicId = VideoFile.public_id;
    //I should introduce the public id in every media files in order to delete them from the cloudinary
    const videoMetaData =await getResources(publicId);
    const duration = videoMetaData.duration

    const video = await Video.create({
        videofile:VideoFile.url,
        thumbnail:thumbnail.url,
        title,
        duration,
        description,
        owner:req.user?._id
    })
    // console.log(video);
    const videoCreated = await Video.findById(video._id)
    if(!videoCreated){
        throw new ApiErrors(500,"Something went wrong while Uploading Video")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,videoCreated,"Video Uploaded Successfully")
    )
})

const getVideoById = asyncHandler(async(req,res)=>{
    const {videoId} = req.params
    if(!videoId){
        throw new ApiErrors(400,"VideoID Needed")
    }
    const video = await Video.findById(videoId).select("videofile thumbnail")
    
    if(!video){
        throw new ApiErrors(500,"Something went wrong while fetching the video")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,video,"Video Fetched Successfully")
    )
})

const updateVideo = asyncHandler(async(req,res)=>{
    //Updating the title and the description of a particular video
    const {videoId} = req.params
    const {title,description} = req.body
    const thumbnailLocalpath = req.file?.path
    // console.log(thumbnailLocalpath);
    
    if(!title || !description){ 
        throw new ApiErrors(400,"Update Field Required")
    }
    if(!videoId){
        throw new ApiErrors(400,"VideoId not found")
    }
    if(!thumbnailLocalpath){
        throw new ApiErrors(400,"Thumbnail file Needed")
    } 
    const thumbnail = await uploadOnCloudinary(thumbnailLocalpath)
    if(!thumbnail){
        throw new ApiErrors(500,"Something went wrong while updating thumbnail")
    }
    const video = await Video.findByIdAndUpdate(videoId,{
        title,
        description,
       thumbnail:thumbnail?.url
    },{
        new:true
    })
    if(!video){
        throw new ApiErrors(500,"Something Went Wrong while updating Video")
    }

   return res
   .status(200)
   .json(
    new ApiResponse(200,video,"Video Fields Updated Successfully")
   )
    
})

const deleteVideo = asyncHandler(async(req,res)=>{
    const {videoId} = req.params
    if(!videoId){
        throw new ApiErrors(400,"VideoID not Found")
    }
    // const deleteOnCloudinary = await deleteOnClodinary(videoId);
    // console.log(deleteOnCloudinary); needs public id in order to delete the asset from the cloudinary
    //So here in this case only the one document of video db schema will be deleted

    const video = await Video.findOneAndDelete({
        _id:videoId
    })
    if(!video){
        throw new ApiErrors(500,"Something went wrong while Deleting Video")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,video,"Video Deleted Successfully")
    )
})

const togglePublishStatus = asyncHandler(async(req,res)=>{
    const {videoId} = req.params
    if(!videoId){
        throw new ApiErrors(400,"Didn't get VideoId")
    }
    const video = await Video.findOneAndUpdate({_id:videoId},{
        isPublished:false   //Ye jo tune likha hai iske bad banda usee kabhi bhi again publish nahi kar payega
    },
    {
        new:true
    }).select("isPublished")
    if(!video){
        throw new ApiErrors(500,"Something Went Wrong while updating Toggle Publish")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,video,"Publish Video Toggled")
    )
})


export {
    getAllVideo,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}