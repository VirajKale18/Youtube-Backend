import 'dotenv/config'  
import mongoose from 'mongoose';
import express from 'express';
import DB_NAME from './Constants.js';
import connectDB from './db/db.js';

// dotenv.config({
//     path:'./env'   
// })  

connectDB();
