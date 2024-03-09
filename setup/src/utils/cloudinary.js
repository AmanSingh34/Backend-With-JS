import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs'
          
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

export {uploadOnCloudinary}