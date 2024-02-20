import 'dotenv/config'  
import mongoose from 'mongoose';
//import express from 'express';
import DB_NAME from './Constants.js';
import connectDB from './db/db.js';
import{app} from './App.js';
import express from 'express';
//const app = express();
// dotenv.config({
//     path:'./env'   
// })  
const PORT = process.env.PORT || 8000;

connectDB()
.then(()=>{
    app.listen(PORT,()=>{`Server is listening on ${PORT}!`});
})
.catch((err)=>{
    console.error(`DB Connection Failed`,error);
});
