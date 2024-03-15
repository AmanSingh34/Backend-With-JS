import { Playlist } from "../models/playlist.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiErrors } from "../utils/apiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";

//createPlaylist
//getUserPlaylist
//getPlaylistById
//addVideoToPlaylist
//removeVideoFromPlaylist
//deletePlaylist
//updatePlaylist

const createPlaylist  = asyncHandler(async(req,res)=>{
    const {name,description} = req.body
    if(!name){
        throw new ApiErrors(400,"Playlist name needed")
    }
    const playlist = await Playlist.create({
        name,
        description,
        owner:req.user?._id,
    })
    if(!playlist){
        throw new ApiErrors(500,"Something went wrong while creating the playlist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,playlist,"Playlist Created")
    )
})


const getUserPlaylist = asyncHandler(async(req,res)=>{
    const {userId}  = req.params
    const playlist = await Playlist.find({owner:userId})
    if(!playlist){
        throw new ApiErrors(500,"Something went Wrong While getting Playlists")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,playlist,"Playlist Fetched"))
})

const getPlaylistById = asyncHandler(async(req,res)=>{
    const {playlistId} = req.params
    if(!playlistId){
        throw new ApiErrors(400,"PlayList Id needed")
    }
    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiErrors(500,"Something went Wrong While getting playlist")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,playlist,"Playlist Fetched")
    )
})

//Pushed the videoId Directly into the array but can be better to push the all details of the video
const addVideoToPlaylist = asyncHandler(async(req,res)=>{
    const {playlistId,videoId} = req.params
    if(!playlistId || !videoId){
        throw new ApiErrors(400,"Playlist and Video Ids Needed")
    }

    const videoToPlaylist = await Playlist.updateOne({_id:playlistId},{
        $push:{
            "videos":videoId
        }
    })
   console.log(videoToPlaylist);
    if(!videoToPlaylist){
        throw new ApiErrors(500,"Can't add the Video To Playlist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,videoToPlaylist,"Video added to Playlist")
    )

})

const removeVideoFromPlaylist = asyncHandler(async(req,res)=>{
    const {playlistId,videoId} = req.params
    if(!playlistId || !videoId){
        throw new ApiErrors(400,"Didn't get the IDs")
    }
    const removeVideoFromPlaylist = await Playlist.updateOne({_id:playlistId},{
        $pull:{
            "videos":videoId
        }
    })
    if(!removeVideoFromPlaylist){
        throw new ApiErrors(500,"Something went wrong while removing video from the db")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,removeVideoFromPlaylist,"Video Removed From the Playlist Successfully")
    )
})

const deletePlaylist = asyncHandler(async(req,res)=>{
    const {playlistId} = req.params
    if(!playlistId){
        throw new ApiErrors(400,"Didn't got the Id")
    }

    const deletePlaylist = await Playlist.deleteOne({_id:playlistId})
    if(!deletePlaylist){
        throw new ApiErrors(500,"Something went wrong while deleting the playlist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,deletePlaylist,"Deleted Playlist Successfully")
    )

})

const updatePlaylist = asyncHandler(async(req,res)=>{
    const {playlistId} = req.params
    const {name,description}  = req.body
    if(!name || !description){
        throw new ApiErrors(400,"Upadte Fields Required")
    }
    const UpdatePlaylist = await Playlist.updateOne({_id:playlistId},{
        name,
        description
    })

    if(!UpdatePlaylist){
        throw new ApiErrors(500,"Something went Wrong while Updating the Playlist")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,UpdatePlaylist,"PlayList Updated Successfully")
    )
})

export {
    createPlaylist,
    getUserPlaylist,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}