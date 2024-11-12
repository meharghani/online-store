import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"


const productSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    desription:{
        type:String,
        required:true
    },
    brand:{
        type:String,
        trim:true
    },
    tags:[String],
    price:{
        type:Number,
        required:true,
        min:0
    },
    stock:{
        type:Number,
        required:true,
        min:0
    },
    images:[
        {
            url:{
                type:String,
                required:true
            },
            public_id:{
                type:String,
                required:true
            }
        }
    ],
    category:{
        type: Schema.Types.ObjectId,
        ref:"Category"
    },
    owner:{
        type: Schema.Types.ObjectId,
        ref:"User"
    }


},{timestamps:true})

productSchema.plugin(mongooseAggregatePaginate)

export const Product = mongoose.model("Product",productSchema)