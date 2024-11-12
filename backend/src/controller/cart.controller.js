import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponce.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const token = req.cookies?.accessToken;
  const decodedToken = token
    ? jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    : null;
  const user = decodedToken ? await User.findById(decodedToken._id) : null;
  const product = await Product.findById(productId);
  let cart = user
    ? await Cart.findOne({ user: user._id })
    : await Cart.findById(req.cookies?.localCartId);

  if (!cart) {
    if (user) {
      cart = new Cart({
        user: user._id,
        item: [],
      });
    } else {
      cart = new Cart({
        items: [],
      });
      res.cookie("localCartId", cart._id);
    }
  }
  const test = cart.items.map((item) => item.product);

  const cartItemIndex = cart.items.findIndex(
    (item) => item.product.toString() === product._id.toString()
  );

  if (cartItemIndex > -1) {
    cart.items[cartItemIndex].quantity += quantity;
    cart.items[cartItemIndex].priceAtPurchase = product.price;
  } else {
    cart.items.push({
      product: product._id,
      quantity,
      priceAtPurchase: product.price,
    });
  }

  await cart.save();
  if (!cart) {
    throw new ApiError(400, "Error while creating cart");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, cart, "Cart created successfully"));
});
export const mergeAnonymousCartWithUserCart = async (userId, localCartId ) => {
  const localCart = localCartId && (await Cart.findById(localCartId));
  let userCart = userId && (await Cart.findOne({ user: userId }));
  const mergCart = (...cartItems) => {
    return cartItems.reduce((acc, items) => {
      items.map((item) => {
        const itemIndex = acc.findIndex((i) => i.product.toString() === item.product.toString());
        if (itemIndex > -1) {
          acc[itemIndex].quantity += item.quantity;
        } else {
          acc.push(item);
        }
      });
      return acc;
    }, []);
  };

  if (userCart && localCart) {
    const mergedItems = mergCart(userCart.items, localCart?.items);
    
    userCart.items = mergedItems.map((item)=>({
        product:item.product,
        quantity:item.quantity,
        priceAtPurchase:item.priceAtPurchase
    }))
    await userCart.save()

  }else if(localCart){
   userCart =  await Cart.create({
        user:userId,
        items:localCart?.items.map((item)=>({
            product:item.product,
            quantity:item.quantity,
            priceAtPurchase:item.priceAtPurchase
        }))
    })
    
  } 
  await Cart.deleteOne({_id:localCartId})
 
};
const getCart = asyncHandler(async(req, res)=>{
  const token = req.cookies?.accessToken
  const decodedToekn = token && jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
  const user = decodedToekn && await User.findById(decodedToekn._id)
  let cart
  if(user){
    cart = await Cart.findOne({user:user._id}).populate("items.product")   
  }else{
    cart = await Cart.findById(req.cookies?.localCartId).populate("items.product")
  }
  if(!cart){
    throw new ApiError(400,"Cart not found")
  }
  return res
  .status(200)
  .json(new ApiResponse(200,cart,"Cart fetched successfully"))
})
const updateItemQuantity = asyncHandler(async(req, res)=>{
  const {productId,quantity } = req.body
  const token = req.cookies?.accessToken
  const decodedToekn = token && jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
  const user = decodedToekn && await User.findById(decodedToekn._id)
  let cart
  
  if(user){
    cart  = await Cart.findOne({user:user._id})
  }else{
    cart = await Cart.findById(req.cookies?.localCartId)
  }
  if(!cart){
    throw new ApiError(400,"You cart is empty")
  }
  const itemIndex = cart.items.findIndex((item)=>item.product.toString() === productId)
  if(itemIndex === -1){
    throw new ApiError(400,"Product not in cart")
  }
  cart.items[itemIndex].quantity = quantity
  await cart.save()
  return res
  .status(200)
  .json(new ApiResponse(200,cart,"Cart updated successfully"))

})
const removeItem = asyncHandler(async(req, res)=>{
  const {productId } = req.params
  const token = req.cookies?.accessToken
  const decodedToekn = token && jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
  const user = decodedToekn && await User.findById(decodedToekn._id)
  let cart
  if(user){
    cart  = await Cart.findOne({user:user._id})
  }else{
    cart = await Cart.findById(req.cookies?.localCartId)
  }
  if(!cart){
    throw new ApiError(400,"You cart is empty")
  }
  cart.items = cart.items.filter((item)=>item.product.toString() !== productId)
  await cart.save()
  if(!cart.items.length > 0){
    await Cart.deleteOne({_id:cart._id})
  }
  return res
  .status(200)
  .json(new ApiResponse(200,cart,"Item deleted successfully"))
})

export { addToCart,getCart, updateItemQuantity,removeItem };
