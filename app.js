import express from 'express'
import cors from 'cors'
import mongoose from "mongoose"

import userRouter from './routes/userRoute.js'
import productRouter from './routes/productRoute.js'
import cartRouter from './routes/cartRoute.js'
import orderRouter from './routes/orderRoute.js'

const app = express()

app.use(express.json())
app.use(cors())

app.use('/api/user', userRouter)
app.use('/api/product', productRouter)
app.use('/api/cart', cartRouter)
app.use('/api/order', orderRouter)

app.get('/health', async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping()

    return res.status(200).json({
      status: "OK",
      db: "connected"
    })
  } catch {
    return res.status(503).json({
      status: "ERROR",
      db: "disconnected"
    })
  }
})

app.get('/', (req, res) => {
  res.send("API Working")
})

export default app