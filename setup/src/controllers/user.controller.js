import { ApiErrors } from '../utils/apiErrors.js';
import {asyncHandler} from '../utils/asyncHandler.js'
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose';


const generateAccessAndRefreshToken = async (userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave:false})

        return {refreshToken,accessToken}
          
    } catch (error) {
        throw new ApiErrors(500,"Something Went Wrong While Creating Access and Refresh Token")
    }
}


const userRegister = asyncHandler( async (req,res) => {

    //1. Getting User Data in JSON
    const { email,password,username,fullname } = req.body   //This Handles data only 
    console.log("Email:",email);

    //2. Validating Data (Not Empty)
        if([email,fullname,password,username].some( //This method checks if there is any field of the above is empty
            (field)=>field?.trim()==="")
        ){
            throw new ApiErrors(400,"All Fields are Required")
        }

    //3. Check For the Existing User
    const exitstingUser = await User.findOne({
        $or:[{ username },{ email }]
    })
    if(exitstingUser){
        throw new ApiErrors(409,"Email or Username is Already Taken")
    }
    
    //4. Check for images, avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverimageLocalPath = req.files?.coverimage[0]?.path;
    if(!avatarLocalPath){
        throw new ApiErrors(400,"Avatar file is required")
    }

    //5. Upload images on Cloudinary
    const avatar = uploadOnCloudinary(avatarLocalPath)
    const coverimage = uploadOnCloudinary(coverimageLocalPath)

    if(!avatar){
        throw new ApiErrors(400,"Avatar File is required")
    }

    //6. Creating entry of user in DB
    const user = await User.create({
        fullname,
        email,
        password,
        avatar:avatar.url,
        coverimage:coverimage?.url || "",
        username:username.toLowerCase()
    })

    //7. Checking user Created or also removing password and refreshToken in response
    const userCreated = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!userCreated){
        throw new ApiErrors(500,"Something went wrong while registering the user")
    }

    //8. Returning the Response
    return res.status(201).json(
        new ApiResponse(200, userCreated, "User Created Successfully")
    )
})

const loginUser  = asyncHandler(async (req,res) =>{
    //5.Check access and refreshToken
    
    //7.Send Response

    //1.get user -> Body
    const {username,email,password} = req.body
    console.log(`username :${username} password :${password}`);
    //2.Username or email
    if(!(username || email)){
        throw new ApiErrors(400,"Username or Email required")
    }
    //3.Find user
    const user = await User.findOne({
        $or:[{username},{email}]
    })
    if(!user){
        throw new ApiErrors(404,"User doesn't exist")
    }
     //4.Check the password
    const isPasswordValid = await user.isPassordCorrect( password )
    if(!isPasswordValid){
        throw new ApiErrors(401,"Invalid user credentials")
    }

    const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    const options = {
        httpOnly:true,
        secure:true
    }

    return res.status(200)
    //6.Send Cookie
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user:loggedInUser,accessToken,refreshToken
            },
            "User Logged in Successfully"
        )
    )

})

const logoutUser = asyncHandler(async (req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true
        }
    )

    const options = {
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken")
    .json(
        new ApiResponse(200,{},"User logged out")
    )
})

const refreshAccessToken = asyncHandler(async(req,res)=>{
   try {
     const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
     if(!incomingRefreshToken){
         throw new ApiErrors(401,"Unauthorized Access")
     }
 
     const decodeToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
     
     const user = await User.findById(decodeToken?._id);
     if(!user){
         throw new ApiErrors(401,"Invalid Refresh Token")
     }
 
     //Matching both the refresh token the user's one and one we received
     if(incomingRefreshToken !== user?.refreshToken){
         throw new ApiErrors(401,"Refresh Token is Expired or Used")
     }
 
     const options = {
         httpOnly:true,
         secure:true
     }
 
     const {NewRefreshToken,accessToken} = await generateAccessAndRefreshToken(user._id)
 
     return res
     .status(200)
     .cookie("accessToken",accessToken,options)
     .cookie("refreshToken",NewRefreshToken,options)
     .json(
         200,
         {
             accessToken,refreshToken:NewRefreshToken
         },
         "Access Token Refreshed"
     )
   } catch (error) {
        throw new ApiErrors(401,error?.message || "Invalid refresh Token")
   }

})

const changeCurrentPassword = asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword} = req.body
    const user = await User.findById(req.user?._id)
    // console.log(newPassword);
    const isPassordCorrect = await user.isPassordCorrect(oldPassword)

    if(!isPassordCorrect){
        throw new ApiErrors(400,"Invalid old Password")
    }
    user.password = newPassword
    await user.save({validateBeforeSave:false})

    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"Password Changed Successfully")
    )
})

const getCurrentUser = asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"user Fetched Successfully")
    )
})

const updateAccountDetails = asyncHandler(async (req,res)=>{
    const {fullname,email} = req.body

    if(!(fullname || email)){
        throw new ApiErrors(400,"All Fields are Required")
    }
    
    const user =await User.findByIdAndUpdate(
        req.user?._id,
       {
        $set:{
            fullname,
            email
        }
       },
       {
        new:true
       }
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"Account details Updated Successfully")
    )
})

const updateUserAvatar = asyncHandler(async (req,res)=>{
    const avatarLocalPath = req.file?.path
    if(!avatarLocalPath){
        throw new ApiErrors(400,"Avatar file is missing")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if(!avatar.url){
        throw new ApiErrors(400,"Error occured while Uploading avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            avatar:avatar.url
        },
        {new:true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"Avatar Image Updated Successfully")
    )
})

const updateUserCoverImage = asyncHandler(async (req,res)=>{
    const coverImageLocalPath = req.file?.path
    if(!coverImageLocalPath){
        throw new ApiErrors(400,"Cover image file is missing")
    }
    const coverimage = await uploadOnCloudinary(coverImageLocalPath)
    if(!coverimage.url){
        throw new ApiErrors(400,"Error occured while Uploading cover image")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            coverimage:coverimage.url
        },
        {new:true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"Cover Image Updated Successfully")
    )
})

const getUserChannelProfile = asyncHandler(async(req,res)=>{
    const {username} = req.params

    if(!username?.trim()){
        throw new ApiErrors(400,"Username is missing")
    }

    const channel = await User.aggregate([
        {
            $match:{
                username:username?.toLowerCase()
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"SubscribedTo"
            }
        },
        {
            $addFields:{
                subsciberCount:{
                    $size:"$subscribers"
                },
                channelSubscribedToCount:{
                    $size:"$SubscribedTo"
                },
                isSubscribed:{
                    $cond:{
                        if:{$in:[req.user?._id,"$subscribers.subscriber"]},
                        then:true,
                        else:false
                    }
                }
            }
        },
        {
            $project:{
                username:1,
                fullname:1,
                subsciberCount:1,
                isSubscribed:1,
                subsciberCount:1,
                channelSubscribedToCount:1,
                email:1,
                avatar:1,
                coverimage:1
            }
        }
    ])

    if(!channel?.length){
        throw new ApiErrors(404,"Channel doesnt Exist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,channel[0],"Channel fetched Succefully")
    )

})

const getWatchHistory = asyncHandler(async (req,res)=>{

    const user = await User.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(req.user._id),
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullname:1,
                                        username:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])
    console.log(user);

    return res
    .status(200)
    .json(
        new ApiResponse(200,user[0].watchHistory,"Watch History Fetch Successfully")
    )
})

export {
    userRegister,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
}