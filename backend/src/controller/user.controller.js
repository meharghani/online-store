import asyncHandler from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import { updatedImageOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js"
import { User } from "../models/user.model.js"
import { ApiResponse } from "../utils/ApiResponce.js"
import jwt from "jsonwebtoken"
import { mergeAnonymousCartWithUserCart } from "./cart.controller.js"

const generateAccessAndRefreshToken = async(userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()
    
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave:false})
        return{
            accessToken,
            refreshToken
        }
    } catch (error) {
        throw new ApiError(401,"Something went wrong while generating access or refresh token")
    }
}
const options = {
    httpOnly:true,
    secure:true
}
const registerUser = asyncHandler(async(req, res)=>{
    //get details from user
    const {username, fullname, email, phoneNumber, password} = req.body
    
    if(
        [username, fullname, phoneNumber, password, email].some((field)=> field?.trim() === "")
    ){
        throw new ApiError(400,"All fields are required")
    }
    //check for existing user
    const existingUser = await User.findOne({
        $or:[{username},{email}]
    })
    if(existingUser){
        throw new ApiError(401,"User already exist with this username or email")
    }
    //chack for avatar
    let avatar
    if(req.file?.path){
         avatar = await uploadOnCloudinary(req.file?.path)
         if(!avatar){
            throw new ApiError(501,"Error while uploadind avatar")
         }
    }
    //set user data
    const user = new User({
        username,
        fullname,
        email,
        password,
        phoneNumber,
        avatar:avatar?.url,
        public_id:avatar?.public_id
    })
    await user.save()
    const newUser = await User.findById(user._id).select("-password -refreshToken")
    if(!newUser){
        throw new ApiError(400,"Error while creating user")
    }
    return res
    .status(200)
    .json(new ApiResponse(200, newUser, "User created successfully"))
})
const loginUser = asyncHandler(async(req, res)=>{
    const {username, email, password} = req.body
    if(!(email || username) || !password){
        throw new ApiError(400,"Login credentials are required")
    }
    const user = await User.findOne({
        $or:[{email},{username}]
    })
    if(!user){
        throw new ApiError(400,"User not register")
    }
    //check password 
    const isPasswordValid = await user.isPasswordCorrect(password)
   
    
    if(!isPasswordValid){
        throw new ApiError(401,"Please provide correct credentials")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)
    const logedInUser = await User.findById(user._id).select("-password -refreshToken")
    mergeAnonymousCartWithUserCart(logedInUser._id,req.cookies.localCartId)
    return res
    .status(200)
    .clearCookie("localCartId")
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(new ApiResponse(200,logedInUser,"User login successfully"))
})
const logoutUser = asyncHandler(async(req, res)=>{
    const userId = req.user?._id

    await User.findByIdAndUpdate(
        userId,
        {
            $unset:{
                refreshToken:1
            }
        }
    )
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"Logged out successfully"))
})
const getCurrentUser = asyncHandler(async(req, res)=>{
    const user = await User.findById(req.user?._id).select("-password -refreshToken")
    if(!user){
        throw new ApiError(500,"Unauthorized request user not found")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,user,"Current user fetched successfully"))
})
const refreshAccessToken = asyncHandler(async(req,res)=>{
    const token = req.cookies?.accessToken
    if(!token){
        throw new ApiError(400,"Unauthorized reques")
    }
    const decodedToken = await jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    const user = await User.findById(decodedToken._id)
    if(user.refreshToken !== req.cookies?.refreshToken){
        throw new ApiError(401,"Token used or exprire")
    }
    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)
    
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(new ApiResponse(200,{accessToken,refreshToken},"Access token refreshed successfully"))

})
const updateUserDetails = asyncHandler(async(req,res)=>{
    const {fullname, phoneNumber, address} = req.body

    if(!(fullname || phoneNumber || address)){
        throw new ApiError(400,"User details are required")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullname,
                phoneNumber,
                address
            }
        },
        {
            new:true
        }
    )
    if(!user){
        throw new ApiError(401,"Error while updating user")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,user, "User updated successfully"))
})
const updateAvatar = asyncHandler(async(req, res)=>{
    const avatarPath = req.file?.path
    if(!avatarPath){
        throw new ApiError(400,"Avatar file is required")
    }
    const user = await User.findById(req.user?._id)
    if(!user){
        throw new ApiError(400,"Unauthorized request")
    }
    let avatar
    if(user.public_id){
        avatar = await updatedImageOnCloudinary(user.public_id,avatarPath)
        user.public_id = avatar?.public_id
        user.avatar = avatar?.url
       await user.save({validateBeforeSave:false})
    }else{
        avatar = await uploadOnCloudinary(avatarPath)
        user.public_id = avatar?.public_id
        user.avatar = avatar?.url
        await user.save({validateBeforeSave:false})
    }
   

    return res
    .status(200)
    .json(new ApiResponse(200,user.avatar,"Avatar updated successfully"))
})
const updatePassword = asyncHandler(async(req, res)=>{
    const {oldPassword, newPassword} = req.body
    if(!oldPassword || !newPassword){
        throw new ApiError(400,"Password required")
    }
    const user = await User.findById(req.user?._id)
    if(!user){
        throw new ApiError(400,"Unauthorized request")
    }
    const isPasswordValid = await user.isPasswordCorrect(oldPassword)
    if(!isPasswordValid){
        throw new ApiError(400,"Old password is not correct")
    }
    user.password = newPassword
    await user.save()
    return res
    .status(200)
    .json(new ApiResponse(200,{},"Password updated successfully"))
})



export{
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    refreshAccessToken,
    updateUserDetails,
    updateAvatar,
    updatePassword
}