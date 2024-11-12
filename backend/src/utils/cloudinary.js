import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
const uploadOnCloudinary = async(localFilePath) => {
    try {
        const result = await cloudinary.uploader.upload(
            localFilePath,
            {
                resource_type:"auto"
            }
        )
        fs.unlinkSync(localFilePath)
        return result
    } catch (error) {
        fs.unlinkSync(localFilePath)
        return null;
        
    }
}
const updatedImageOnCloudinary = async(public_id,localFilePath) =>{
    try {
        if(!public_id || !localFilePath){
            return null
        }
        const response = await cloudinary.uploader.upload(
            localFilePath,
            {
                public_id,
                overwrite:true
            }
        )
       fs.unlinkSync(localFilePath)
        
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath)
        return null
    }
}
const deleteFileOnCloudinary = async(public_id)=>{
    try {
        await cloudinary.uploader.destroy(public_id,{resource_type:"image"},(error, result)=>{
            if(error){
                console.error("Error deleti`4ng file", error)
            }else{
                console.log("File deleted successfully",result)
            }
        })
    } catch (error) {
        console.log(error)
    }
}

export{
    uploadOnCloudinary,
    updatedImageOnCloudinary,
    deleteFileOnCloudinary
}