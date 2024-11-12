import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import asyncHandler from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken"



const jwtVerify = asyncHandler(async(req, res, next) =>{
    try {
        const accessToken = req.cookies?.accessToken
        if(!accessToken){
            throw new ApiError(400,"Unauthorized request")
        }
        const decodedToken = await jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
       
        
        
        const user = await User.findById(decodedToken._id).select("-password -refreshToken")
        if(!user){
            throw new ApiError(400,"Token used or expired")
        }

        
        req.user = user
        next()
    } catch (error) {
        throw new ApiError(400,"Token not valid")
    }
})
export{
    jwtVerify
}