import { Category } from "../models/category.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponce.js";
import asyncHandler from "../utils/asyncHandler.js";



const createCategory = asyncHandler(async(req, res)=>{
    const {name , description} = req.body
     if(!name || !description){
        throw new ApiError(400,"Name or description requires")
     }
     const category = await Category.create({
        name,
        description
     })
     if(!category){
        throw new ApiError(500,"Error while creating category")
     }
     return res
     .status(200)
     .json(new ApiResponse(200, category,"Category created successfully"))
})
const getCategoryById = asyncHandler(async(req, res)=>{
    const {categoryId} = req.params
    const category = await Category.findById(categoryId)
    if(!category){
        throw new ApiError(400,"Error while feteching category")
    }
    return res
    .status(200)
    .json(new ApiResponse(200, category, "Category fetched successfully"))
})
const getCategories = asyncHandler(async(req, res)=>{
    const categories = await Category.find()
    if(!categories){
        throw new ApiError(500,"You dont have any category")
    }
    return res
    .status(200)
    .json(new ApiResponse(200, categories, "Categories fetched successfully"))
})
const updateCategory = asyncHandler(async(req, res)=>{
    const {categoryId} = req.params
    const {name ,description} = req.body
    if(!categoryId){
        throw new ApiError(400,"Category ID required")
    }
    const category = await Category.findByIdAndUpdate(categoryId,
        {
            $set:{
                name,
                description
            }
        },
        {new:true}
    )
    if(!category){
        throw new ApiError(400,"Error while updating category")
    }
    return res
    .status(200)
    .json(new ApiResponse(200, category, "Category updated successfully"))
})
const deleteCategory = asyncHandler(async(req, res)=>{
    const {categoryId} = req.params
    if(!categoryId){
        throw new ApiError(400,"Category Id required")
    }
    await Category.findByIdAndDelete(categoryId)

    return res
    .status(200)
    .json(new ApiResponse(200,{},"Category deleted successfully"))
})

export{
    createCategory,
    getCategoryById,
    getCategories,
    updateCategory,
    deleteCategory
}