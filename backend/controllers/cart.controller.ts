import { Request, Response } from "express"
import { Product } from "../models/product.model.js"


export async function getCartProducts (req: Request, res: Response) {
  try {
    const products = await Product.find({ _id: { $in: req.user?.cartItems }})
    const cartItems = products.map(product => {
      const item = req.user?.cartItems.find(carItem => carItem.id === product.id)
      return {...product.toJSON(), quantity: item?.quantity}
    })

    res.json(cartItems)
    return
  } catch (error: any) {
    console.log('Error in getCartProducts controller', error.message)

    res.status(500).json({ message: 'Server error', error: error.message })

    return
  }
}


export async function addToCart (req: Request, res: Response) {
  try {
    const { productId } = req.body
    const user = req.user

    const existingItem = user?.cartItems.find(item => item.id === productId)
    if (existingItem) {
      existingItem.quantity += 1
    } else {
      user?.cartItems.push(productId)
    }

    await user?.save()

    res.json(user?.cartItems)
    return
  } catch (error: any) {
    console.log('Error in addToCart controller', error.message)

    res.status(500).json({ message: 'Server error', error: error.message })

    return
  }
}


export async function deleteAllFromCart (req: Request, res: Response) {
  try {
    const { productId } = req.body
    const user = req.user

    if (!user) {
      res.status(401).json({ message: 'Unauthorized User' })  
      return
    }
    
    if (!productId) {
      user.set('cartItems', [])
    } else {
      user.cartItems.pull({ _id: productId })
    }

    await user.save()

    res.json(user.cartItems)

    return
  } catch (error: any) {
    console.log('Error in deleteAllFromCart controller', error.message)

    res.status(500).json({ message: 'Server error', error: error.message })

    return
  }
}


export async function updateQuantity (req: Request, res: Response) {
  const user = req.user

  if (!user) {
    res.status(401).json({ message: 'Unauthorized User' })  
    return
  }

  try {
    const { id: productId } = req.params
    const { quantity } = req.body

    const existingItem = user.cartItems.find((item) => item.id === productId)

    if (existingItem) {
      existingItem.quantity = quantity

      await user.save()

      res.json(user.cartItems)
      return
    } else {
      res.status(404).json({ message: "Product not found" })
      return
    }
  } catch (error: any) {
    console.log('Error in updateQuantity controller', error.message)

    res.status(500).json({ message: 'Server error', error: error.message })

    return
  }
}