import express from 'express'
import { addToCart, deleteAllFromCart, getCartProducts, updateQuantity } from '../controllers/cart.controller.js'
import { protectRoute } from '../middleware/auth.middleware.js'



const router = express.Router()


router.get('/', protectRoute, getCartProducts)
router.post('/', protectRoute, addToCart)
router.put('/:id', protectRoute, updateQuantity)
router.delete('/', protectRoute, deleteAllFromCart)


export default router