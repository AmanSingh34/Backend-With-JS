import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs'
import { ApiErrors } from './apiErrors.js';
          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localfilepath)=>{
    try {
        if(!localfilepath) return null
    //Upload the file
    const response  = await cloudinary.uploader.upload(localfilepath,{
        resource_type:'auto'
    })
    //File uploaded successfully
    console.log("File uploaded on Cloudinary ",response.url);
    return response;
    } catch (error) {
        fs.unlinkSync(localfilepath)    //this will remove the local saved file from our server as file upload failed
        return null
    }
}

const getResources = async (publicId)=>{
    try {
        if(!publicId){
            throw new ApiErrors(400,"Public Id requiredd")
        }
        const response = await cloudinary.api.resource(publicId,{
            resource_type:'video',
            media_metadata:true
        })
        if(!response){
            throw new ApiErrors(500,"Can't get the resources")
        }
        return response
    } catch (error) {
        console.log("Something went wrong while getting resources");
    }
}

const deleteOnClodinary = async (localfilepath)=>{
    try {
        if(!localfilepath) return null;
        const response = await cloudinary.uploader
        .destroy(localfilepath,{
            resource_type:'video'
        })
        console.log("File Deleted Successfully",response)
    } catch (error) {
        console.log("Caught error While Updating : ",error);
    }
}

export {uploadOnCloudinary,deleteOnClodinary,getResources}