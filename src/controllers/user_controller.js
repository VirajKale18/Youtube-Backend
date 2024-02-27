import {asyncHandler} from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js';
import {User} from '../models/user_model.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';
import { app } from '../App.js';
const generateAccessAndRefreshTokens = async(userId)=>{
  try { 
      const user = await User.findById(userId)
      const accessToken = user.generateAccessToken()
      const refreshToken = user.generateRefreshToken()

      user.refreshToken = refreshToken
      await user.save({ validateBeforeSave:false });
      
      return { accessToken, refreshToken }

  } catch (error) {
        throw new ApiError(500,"Something went wrong regarding tokens")
  }
}

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
    //console.log("req.files :- ",req.files)
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

const loginUser = asyncHandler(async(req,res)=>{

      //get input credentials from user
      const {email,username,password} = req.body;
      console.log(req.body);
      //if neither username is persent and nor email is present then it throws this error 
      if(!username && ! email){
          throw new ApiError(400,"username or email is required");
      }
      
      //stores user data through the given username password and in user variable
      const user = await User.findOne({
          $or:[{ username },{ email }]
      })
      //if the user is not found in DB throw error
      if(!user){
        throw new ApiError(404,"user not exists");
      }
      //if found validates the password given by user (user.isPasswordCorrect method defined in user model) 
     const isPasswordValid = await user.isPasswordCorrect(password);      
     if(!isPasswordValid){
      throw new ApiError(401,"Invalid credentials");
    }
    //after validation generates accesstoken and refresh token and saves refreshToken in DB from the method below:- 
    const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id);
     const loggedInUser = await User.findById(user._id).select("-password -refereshToken");

     const options = {
      httpOnly:true,
      secure:true
     }
     //returns the accesstoken and refresh token to user via cookies 
     return res
     .status(200)
     .cookie("accessToken",accessToken,options)
     .cookie("refreshToken",refreshToken,options)
     .json(
        new ApiResponse(
          200,
          {
            user:loggedInUser,accessToken,
                 refreshToken
          },
          "User Logged In Successfully"
        )
     )

})

const logoutUser = asyncHandler(async(req,res)=>{
  console.log("user data :-",req.user)
  //finds the user info from the req.user method created in verifyJWT middleware and sets it refreshToken as undefined
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
 //clears the accesstoken and refresh token cookie from user's browser.
 return res.status(200)
 .clearCookie("accessToken",options)
 .clearCookie("refreshToken",options)
 .json(new ApiResponse(200,{},"User logged Out"))
})

const renewAccessToken = asyncHandler(async(req,res)=>{
    //get refresh token of user through cookies
    const incomingRefreshtoken = req.cookies.refreshToken || req.body.refreshToken;
    
    if(!incomingRefreshtoken){
      throw new ApiError(401,"Unathorized request");
    }
    //try catch is optional after all the conditioning inside try block
  try {
    //compare the user's browser refresh token with server refresh token and get dedcoded response 
     const decodedToken = jwt.verify(incomingRefreshtoken,process.env.REFRESH_TOKEN_SECRET);
    //get user detail from decodedToken  
    const user = User.findById(decodedToken._id);
    if(!user){
      throw new ApiError(401,"Invalid Refresh token");
    }
     
    //validate user browser's refersh token and user's database refresh token
    if( incomingRefreshtoken!== user?.refreshToken ){
        throw new ApiError(401,"Refresh Token is expired or used")
    }
  
    const options = {
      httpOnly:true,
      secure:true
    }
    
    //generate new accesToken,refershToken from the generateAccessAndRefreshTokens method 
     const {accessToken,newRefreshToken} = generateAccessAndRefreshTokens(user._id);
    
     //set refresh,access token cookies and send succesfull json response 
     return res
     .status(200)
     .cookie("accessToken",accessToken)
     .cookie("refreshToken",newRefreshToken)
     .json(
        new ApiResponse(
          200,{
          accessToken,
          refreshToken:newRefreshToken
          },
          "accessToken renewed Successfully!"
  
        )
  
     )
  
  } catch (error) {
    throw new ApiError(401,error?.message||"Invalid refresh token");
  }
  
})

export {registerUser,
        loginUser,
        logoutUser,
        renewAccessToken
}