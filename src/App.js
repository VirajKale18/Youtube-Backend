import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';   

const app = express();

//to allow cross orign requests from different hosts
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))
//to define a limit of fetch this much size of json limit
app.use(express.json({limit:'16kb'}))
app.use(express.urlencoded({extended:true,limit:'16kb'}))
app.use(express.static('public'))


//routes import 
 import userRouter from "./routes/user_route.js" 

 app.use('/api/v1/users',userRouter);

 
 export {app}