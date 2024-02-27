import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import  jwt  from "jsonwebtoken";
import { User } from "../models/user_model.js";

const verifyJWT = asyncHandler(async(req,res,next)=>{
    try {
        //gets user's accesstoken from user cookies
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
        console.log("tokVal :-",token); 
        
        //if not present invalid request
        if(!token){
           throw new ApiError(401,"Unauthorized Error !")
        }
        //if token present decodes user data through verifying user token and server token  
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
        if(!user){
            throw new ApiError(401,"Invalid Access token")
        }
        //creates new user method in req object and has the user info without password and refresh token
        req.user = user;
        
        next()
    }   catch (error) {
        throw new ApiError(401,error?.message || "invalid Access Token")
    }

})

export {
    verifyJWT
}