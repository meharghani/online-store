import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"


const app = express()


app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    Credential:true
}))
app.use(cookieParser())


//Router
import userRouter from "./routes/user.routes.js"
import productRouter from "./routes/product.routes.js"
import cartRouter from "./routes/cart.routes.js"
import orderRouter from "./routes/order.routes.js"
import categoryRouter from "./routes/category.routes.js"

app.use("/api/v1/user",userRouter)
app.use("/api/v1/product",productRouter)
app.use("/api/v1/cart",cartRouter)
app.use("/api/v1/order",orderRouter)
app.use("/api/v1/category",categoryRouter)

export{
    app
}