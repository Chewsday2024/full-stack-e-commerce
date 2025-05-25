import cookieParser from 'cookie-parser'
import express from 'express'
import dotenv from 'dotenv'


import { connectDB } from './lib/db.js'



import analyticsRoutes from './routes/analytics.route.js'
import productRoutes from './routes/product.route.js'
import paymentRoutes from './routes/payment.route.js'
import couponRoutes from './routes/coupon.route.js'
import authRoutes from './routes/auth.route.js'
import cartRoutes from './routes/cart.route.js'



dotenv.config()

const app = express()

app.use(express.json({ limit: '5mb' }))
app.use(cookieParser())

const PORT = process.env.PORT || 9000





app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/coupons', couponRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/analytics', analyticsRoutes)





app.listen( PORT, () => {
  console.log(`Greeting！Tarnished. Welcome to the Lands Between on trail ${PORT}！`)
  connectDB()
})