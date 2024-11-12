import mongoose from "mongoose";
import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponce.js";
import asyncHandler from "../utils/asyncHandler.js";
import { deleteFileOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";



const addProduct = asyncHandler(async(req, res)=>{
    const {name, desription, brand, tags, price, stock,category} = req.body
    
    //upload images on cloudinary
    const files = req.files
    const result = files.map((file)=>{
        return uploadOnCloudinary(file.path)
    })
    const images = await Promise.all(result)
    if(!images){
        throw new ApiError(400,"Error while uploading images")
    }
    const imagesData = images?.map((image)=>({url:image.url,public_id:image.public_id}))
    const product = new Product({
        name,
        desription,
        brand,
        price,
        stock,
        tags,
        category,
        owner:req.user?._id,
        images:imagesData
    })
    await product.save()
    if(!product){
        throw new ApiError(400,"Product creation failed")
    }
    return res
    .status(200)
    .json(new ApiResponse(200, product,"Product created successfully"))
})
const getProducts = asyncHandler(async(req, res)=>{
    const {page=1, limit=10, query='', sortBy='createdAt', sortType="desc",userId} = req.query
    let fillter = {}
    if(userId){
        fillter.owner = new mongoose.Types.ObjectId(userId)
    }
    if(query){
        fillter.$or = [
            {name:{$regex: query,$options:"i"}},
            {desription:{$regex:query, $options:"i"}},
            {tags:{$regex: query, $options:"i"}}
        ]
    }
    const sorOptions = {}
    sorOptions[sortBy] = sortType === "desc"? 1 : -1
    const products = await Product.find(fillter)
    .sort(sorOptions)
    .skip((page-1)*limit)
    .limit(parseInt(limit))

    const totalProducts = await Product.countDocuments(fillter)

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        {
            products,
            total:totalProducts,
            page:parseInt(page),
            limit:parseInt(limit),
            TotalPage: Math.ceil(totalProducts/limit)
        },
        "All products are fetched"
    ))
})
const getProductById = asyncHandler(async(req, res)=>{
    const {productId} = req.params
    
    if(!productId){
        throw new ApiError(400,"Product Id required")
    }
    const product = await Product.findById(productId)

    if(!product){
        throw new ApiError(400,"Product not available")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,product,"Product fetched successfully"))
})
const updateProduct = asyncHandler(async(req, res)=>{
    const {productId} = req.params
    const {name, desription, tags, price, stock, brand} = req.body
    const product = await Product.findByIdAndUpdate(
        productId,
        {
            $set:{
                name,
                desription,
                tags,
                price,
                stock,
                brand
            }
        },
        {
            new:true
        }
    )
    if(!product){
        throw new ApiError(400,"Product updation failed")
    }
    return res
    .status(200)
    .json(new ApiResponse(200, product, "Product updated successfully"))
    

})
const updateProductImages = asyncHandler(async(req, res)=>{
    const files = req.files
    const {productId, imagePublicId} = req.params
    const product = await Product.findById(productId)
    if(!files?.length > 0){
        throw new ApiError(400,"Images are not available")
    }    
    if(product?.images?.length > 0 ){
        product.images.map((image)=>{
            deleteFileOnCloudinary(image.public_id)
        } )
    }
       
        const result = files.map((file)=>{
           return uploadOnCloudinary(file.path)
        })
        const images = await Promise.all(result)
        if(!images?.length > 0){
            throw new ApiError(400,"Error while uploading images")
        }
        
        const imagesData = images?.map((image)=>({url:image.url,public_id:image.public_id}))
        
        product.images = imagesData
        await product.save()
        return res
        .status(200)
        .json(new ApiResponse(200, product, "Product images updated successfully"))

})
const deleteProduct = asyncHandler(async(req, res)=>{
    const userId = req.user?._id
    const {productId} = req.params
    const product = await Product.findOne({_id:productId,owner:userId})
    if(!product){
        throw new ApiError(400,"You are not owner of this product")
    }
    if(product.images.length > 0){
    product.images.map((image)=>{
        deleteFileOnCloudinary(image.public_id)
    })
}
    await Product.deleteOne(product._id)
    return res
    .status(200)
    .json(new ApiResponse(200,{},"Product deleted successfullt"))

})
export{
    addProduct,
    getProducts,
    getProductById,
    updateProduct,
    updateProductImages,
    deleteProduct
}