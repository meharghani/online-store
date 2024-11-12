import mongoose from "mongoose";

const connectionDB = async()=>{
    try {
        const connectionInstance = await mongoose.connect(process.env.MONGODB_URL)
            console.log(`MongoDB Connected with HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log(`MongoDB connection error: ${error}`);
        process.exit(1)
        
    }
}


export{
    connectionDB
}