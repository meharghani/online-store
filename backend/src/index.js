import { app } from "./app.js";
import { connectionDB } from "./db/index.js";
import dotenv from "dotenv"


dotenv.config({
    path:"../.env"
})

const port  = process.env.PORT || 3000

connectionDB().then(()=>{
    app.listen(port,()=>{
        console.log(`Server running on port: ${port}`);
    })
}).catch((err)=>{
    console.log(`MongoDB connection error: ${err}`);
    
})