import { Request, Response } from "express";
import { Coupon } from "../models/coupon.model.js";
import { stripe } from "../lib/stripe.js";
import { createStripeCoupon } from "../utils/createStripeCoupon.js";
import { createNewCoupon } from "../utils/createNewCoupon.js";
import { mongoOrderType, Order } from "../models/order.model.js";


export async function createCheckoutSession (req: Request, res: Response) {
  try {
    const { products, couponCode } = req.body

    if (!Array.isArray(products) || products.length === 0) {
      res.status(400).json({ error: 'Invalid or empty products array' })
      return
    }

    let totalAmount = 0

    const lineItems = products.map(product => {
      const amount = Math.round(product.price * 100)
      totalAmount += amount * product.quantity

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            images: [product.image]
          },
          unit_amount: amount
        },
        quantity: product.quantity || 1
      }
    })

    let coupon = null
    if (couponCode) {
      coupon = await Coupon.findOne({ code: couponCode, userId: req.user?._id, isActive: true })

      if (coupon) {
        totalAmount -= Math.round(totalAmount * coupon.discountPercentage / 100)
      }
    }

    let session = null

    if (req.user) {
      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
        discounts: coupon
          ? [
            {
              coupon: await createStripeCoupon(coupon.discountPercentage)
            }
          ]
          : [],
        metadata: {
          userId: req.user._id.toString(),
          couponCode: couponCode || '',
          products: JSON.stringify(
            products.map(p => ({
              id: p._id,
              quantity: p.quantity,
              price: p.price
            }))
          )
        }
      })
    }
    

    if (totalAmount >= 20000 && req.user) {
      await createNewCoupon(req.user._id.toString())
    }

    res.status(200).json({
      id: session?.id,
      totalAmount: totalAmount / 100
    })

  } catch (error: any) {
    console.log('Error in createCheckoutSession controller', error.message)

    res.status(500).json({ message: 'Server error', error: error.message })
  }
}


export async function checkoutSuccess (req: Request, res: Response) {
  try {
    const { sessionId } = req.body

    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status === 'paid') {
      if (session.metadata?.couponCode) {
        await Coupon.findOneAndUpdate({
          code: session.metadata.couponCode,
          userId: session.metadata.userId
        }, {
          isActive: false
        })
      }

      const products = session.metadata && JSON.parse(session.metadata.products) as mongoOrderType['products'][number][]

      const newOrder = new Order({
        user: session.metadata?.userId,
        products: products?.map(product => ({
          product: product.id,
          quantity: product.quantity,
          price: product.price
        })),
        totalAmount: session.amount_total && session.amount_total / 100,
        stripeSessionId: sessionId
      })

      await newOrder.save()

      res.status(200).json({
        success: true,
        message: 'Payment successful, order created, and coupon deacticated if used.',
        orderId: newOrder._id
      })
    }
  } catch (error: any) {
    console.log('Error in checkoutSuccess controller', error.message)

    res.status(500).json({ message: 'Server error', error: error.message })
  }
}