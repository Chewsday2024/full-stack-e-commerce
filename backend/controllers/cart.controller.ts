import { Request, Response } from "express";
import { User } from "../models/user.model.js";
import { Product } from "../models/product.model.js";



export async function getCartProducts (req: Request, res: Response) {
  try {
    const products = await Product.find({ _id: { $in: req.user?.cartItems }})
    const cartItems = products.map(product => {
      const item = req.user?.cartItems.find(carItem => carItem.id === product.id)
      return {...product.toJSON(), quantity: item?.quantity}
    })

    res.json(cartItems)
  } catch (error: any) {
    console.log('Error in getCartProducts controller', error.message)

    res.status(500).json({ message: 'Server error', error: error.message })
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
  } catch (error: any) {
    console.log('Error in addToCart controller', error.message)

    res.status(500).json({ message: 'Server error', error: error.message })
  }
}


export async function deleteAllFromCart (req: Request, res: Response) {
  try {
    const { productId } = req.body
    const user = req.user

   
    await User.updateOne(
      { _id: user?._id },
      { $pull: { cartItems: { product: productId } } }
    )

    const updatedUser = await User.findById(user?._id).populate("cartItems.product");

    res.json(updatedUser?.cartItems)
  } catch (error: any) {
    console.log('Error in deleteAllFromCart controller', error.message)

    res.status(500).json({ message: 'Server error', error: error.message })
  }
}


export async function updateQuantity (req: Request, res: Response) {
  try {
    const { id: productId } = req.params
    const { quantity } = req.body
    const user = req.user
    
    if (quantity === 0) {
      await User.findByIdAndUpdate(user?._id, {
        $pull: {
          cartItems: { product: productId }
        }
      })
    } else {
      await User.findOneAndUpdate(
        {
          _id: user?._id,
          'cartItems.product': productId
        },
        {
          $set: {
            'cartItems.$.quantity': quantity
          }
        }
      )
    }

    const updatedUser = await User.findById(user?._id).populate('cartItems.product');

    res.json(updatedUser?.cartItems)
  } catch (error: any) {
    console.log('Error in updateQuantity controller', error.message)

    res.status(500).json({ message: 'Server error', error: error.message })
  }
}