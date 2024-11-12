import { Cart } from "../models/cart.model.js";
import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponce.js";
import asyncHandler from "../utils/asyncHandler.js";

const createOrderFromCart = asyncHandler(async (req, res) => {
  const user = req.user;
  const { shippingAddress } = req.body;

  const cart = user && (await Cart.findOne({ user: user._id }));
  if (!cart) {
    throw new ApiError(400, "Your cart is empty");
  }
  let totalAmount = 0;
  const orderItem = cart.items.map((item) => {
    totalAmount += item.priceAtPurchase * item.quantity;
    return {
      product: item.product,
      quantity: item.quantity,
      price: item.priceAtPurchase,
    };
  });

  if (!orderItem) {
    throw new ApiError(400, "Product not found");
  }
  const order = new Order({
    customer: user._id,
    items: orderItem,
    shippingAddress: shippingAddress ? shippingAddress : user.address,
    paymentMethod: "Debit Card",
    totalAmount: totalAmount,
  });
  await order.save();
    
  order.items?.map(async(item)=>{
     const product = await Product.findById(item.product)   
     product.stock -= item.quantity
     await product.save()
   })
  await Cart.findByIdAndDelete(cart._id)
  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order created successfully"));
});
const updateOrderStatus = asyncHandler(async(req, res)=>{
  const {orderId, status} = req.body
  const order = orderId && await Order.findByIdAndUpdate(orderId,
    {
      $set:{
        status
      }
    },
    {new:true}
  )
  if(!order){
    throw new ApiError(400,"Error while updating status")
  }
 
  return res
  .status(200)
  .json(new ApiResponse(200,order,"Order status updated successfully"))

})
const getUserOrders = asyncHandler(async (req, res)=>{
  const orders = await Order.find({customer:req.user?._id}).populate("items.product")
  if(!orders || orders.length === 0){
    throw new ApiError(400,"You dont have any order")
  }
  return res
  .status(200)
  .json(new ApiResponse(200,orders,"User orders fetched succefully"))
})
const deleteOrder = asyncHandler(async(req,res)=>{
  const {orderId} = req.params
  if(!orderId){
    throw new ApiError(400,"Order not available")
  }
  const order = await Order.findByIdAndDelete(orderId)
  if(order.status === "Pending"){
    order.items.map(async(item)=>{
      const product = await Product.findById(item.product)
      
      product.stock += item.quantity
      await product.save()
    })
  }
  
  return res
  .status(200)
  .json(new ApiResponse(200,{},"Order deleted successfully"))
})
export { createOrderFromCart, updateOrderStatus,getUserOrders, deleteOrder };
