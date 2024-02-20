import {asyncHandler} from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js';
import {User} from '../models/user_model.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';
const registerUser =  asyncHandler(async(req,res)=>{
    //get user data from front-end
    const {fullName,username,email,password} = req.body;
    //validation
    if([fullName,username,email,password].some((field)=>{
        //if also after trimming the field is empty
        field?.trim()===""})){
          throw new ApiError(401,"fields cannot be empty")
        }

        //check if user already exists
  const existedUser = await User.findOne({
        $or: [{username},{email}]
    })
    if(existedUser){
        throw new ApiError(409,"User already exists")
    }
    console.log("req.files :- ",req.files)
    //check if avatar file and cover file exists
   const avatarLocalPath = req.files?.avatar[0]?.path;
   //const coverImageLocalPath = req.files?.coverImage[0]?.path;
   const coverImageLocalPath = req.files && req.files.coverImage && req.files.coverImage[0]?.path;
   //validating avatar file
   if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
   }    
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  //if avatar file not uploaded on cludinary throw error
  if(!avatar){
    throw new ApiError(400,"Avatar file is required")
  }
  //create user after validation 
 const user =  await User.create({
    fullName,
    avatar:avatar.url,
    coverImage:coverImage?.url || "",
    email,
    username,
    password,
    username:username.toLowerCase()

  })
  // Fetch the created user from DB without password and jwt token 
 const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
 )
 //if not user createdf send error
  if(!createdUser) throw new ApiError(500,"Something went wrong while registering user")
  
  // return user details in resoponse from server
  return res.status(201).json(
    new ApiResponse(200,createdUser,"user registered successfully")
  )
  
})      

export {registerUser}