import mongoose from 'mongoose';
import  jwt  from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
     username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
     },
     password:{
        type:String,
        required:[true,'password is required'],
     },
     email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
     },
     fullName:{
        type:String,
        required:true,
        lowercase:true,
        index:true
     },
     avatar:{
        type:String, //cloudinary url
        required:true
     },
     coverImage:{
        type:String
     },
     watchHistory:[
        {
        type:mongoose.Schema.Types.ObjectId,
        ref:'Video'
     }
    ],
    refreshToken:{
        type:String
    }

},{timestamps:true});

userSchema.pre('save',async function(next){
    //if the password is not changed and any other field is changed and then saved the return and do next 
    if(!this.isModified('password'))return next();

    //if the password is modified and saved then only encrypt and do next
    this.password = await bcrypt.hash(this.password,10);
    next();
})

//to check the encrypted password :- 
//isPasswordCorrect consist a boolean value
userSchema.methods.isPasswordCorrect = async function(password){
    //compares the user entered pass with the hash pass and returns a boolean value
    return await bcrypt.compare(password,this.password);
}

//function to generate access token 
userSchema.methods.generateAccessToken = function(){
   return jwt.sign({
        _id : this._id,
        email:this.email,
        username:this.username,
        fullName:this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    })
}    
//function to generate referesh token
userSchema.methods.generateRefreshToken = function(){
   return jwt.sign({
        _id : this._id 
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    })
}    


export const User = mongoose.model('User',userSchema);

