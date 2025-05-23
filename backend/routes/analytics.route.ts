import express from 'express'
import { adminRoute, protectRoute } from '../middleware/auth.middleware.js'
import { analyticsInfo } from '../controllers/analytic.controller.js'


const router = express.Router()



router.get('/', protectRoute, adminRoute, analyticsInfo)




export default router