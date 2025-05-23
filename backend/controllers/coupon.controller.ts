import { Request, Response } from "express";
import { Coupon } from "../models/coupon.model.js";




export async function getCoupon (req: Request, res: Response) {
  try {
    const coupon = await Coupon.findOne({ userId: req.user?._id, isActive: true })

    res.json(coupon || null)
  } catch (error: any) {
    console.log('Error in getCoupon controller', error.message)

    res.status(500).json({ message: 'Server error', error: error.message })
  }
}


export async function validateCoupon (req: Request, res: Response) {
  try {
    const { code } = req.body
    const coupon = await Coupon.findOne({ code: code, userId: req.user?._id, isActive: true })

    if (!coupon) {
      res.status(404).json({ message: 'Coupon not found' })
      return
    }

    if (coupon.expirationDate < new Date()) {
      coupon.isActive = false
      await coupon.save() 
      res.status(404).json({ message: 'Coupon expired' })
      return
    }

    res.json({
      message: 'Coupon is valid',
      code: coupon.code,
      discountPercentage: coupon.discountPercentage
    })
  } catch (error: any) {
    console.log('Error in validateCoupon controller', error.message)

    res.status(500).json({ message: 'Server error', error: error.message })
  }
}