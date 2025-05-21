import express from 'express'
import dotenv from 'dotenv'


import authRoutes from './routes/auth.route.js'
import { connectDB } from './lib/db.js'

dotenv.config()
const app = express()


const PORT = process.env.PORT || 9000




app.use('/api/auth', authRoutes)





app.listen( PORT, () => {
  console.log(`Greeting！Tarnished. Welcome to the Lands Between on trail ${PORT}！`)
  connectDB()
})