import mongoose from 'mongoose';
import DB_NAME from '../Constants.js';

const connectDB = async ()=>{
    try {
       const connectionInstance = await mongoose.connect(`${process.env.URL}/${DB_NAME}`,{useNewUrlParser: true,
       useUnifiedTopology: true,})
       console.log(`\n MongoDB connected !! DB HOST:${connectionInstance.connection.host}`);    
    } catch (error) {
        console.error("Mongo Connection Error :",error);
        process.exit(1);
    }
}

export default connectDB