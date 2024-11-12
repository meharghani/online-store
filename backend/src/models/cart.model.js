import mongoose, { Schema } from "mongoose";

const cartItemSchema = new Schema({
    product:{
        type:Schema.Types.ObjectId,
        ref:"Product",
    },
    quantity:{
        type:Number,
        required:true,
        min:[1, "Quantity must be atleast 1"],
        default:1
    },
    priceAtPurchase:{
        type:Number,
        required:true
        
    }
},{timestamps:true})

const cartSchema = new Schema({
    user:{
        type: Schema.Types.ObjectId,
        ref:"User",
        unique:true
    },
    items:[cartItemSchema],
    totalPrice:{
        type:Number,
        default: 0
    },
    size:{
        type:Number,
        default:0
    }

},{timestamps:true})


cartSchema.pre('save', function(next){
    this.size = this.items.reduce((acc, item)=>acc + item.quantity,0)
    this.totalPrice = this.items.reduce((acc, item)=>acc + item.quantity * item.priceAtPurchase, 0)
    
    next()
})

export const Cart = mongoose.model("Cart",cartSchema) 