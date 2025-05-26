import { create } from 'zustand'
import axios from '../lib/axios'
import { AxiosError } from 'axios'
import toast from 'react-hot-toast'
import type { productType } from '../types/productType'
import type { couponType } from '../types/couponType'




type cartStoreType = {
  cart: productType[]
  coupon: couponType | null
  total: number
  subtotal: number
  isCouponApplied: boolean
  getCartItems: () => Promise<void>
  addToCart: ( product: productType ) => Promise<void>
  removeFromCart: ( productId: string ) => Promise<void>
  updateQuantity: ( product: string, quantity: number ) => Promise<void>
  calculateTotals: () => void
}


export const useCartStore = create<cartStoreType>((set, get) => ({
  cart: [],
  coupon: null,
  total: 0,
  subtotal: 0,
  isCouponApplied: false,
  getCartItems: async () => {
    try {
      const res = await axios.get('/cart')
      set({ cart: res.data })
      get().calculateTotals()
    } catch (error) {
      set({ cart: [] })

      if (error instanceof AxiosError) toast.error(error.response?.data.message || 'An error occurred')
    }
  },
  addToCart: async ( product ) => {
    try {
      await axios.post('/cart', { productId: product._id })
      toast.success('Product added to cart')

      set(pre => {
        const existingItem = pre.cart.find(item => item._id === product._id)
        const newCart = existingItem
          ? pre.cart.map(item => (item._id === product._id && item.quantity ? { ...item, quantity: item.quantity + 1 } : item))
          : [...pre.cart, {...product, quantity: 1}]
        
        return { cart: newCart }
      })

      get().calculateTotals()
    } catch (error) {
      if (error instanceof AxiosError) toast.error(error.response?.data.message || 'An error occurred')
    }
  },
  removeFromCart: async ( productId ) => {
    await axios.delete('/cart', { data: { productId } })

    set(pre => ({cart: pre.cart.filter(item => item._id !== productId)}))

    get().calculateTotals()
  },
  updateQuantity: async ( productId, quantity ) => {
    if (quantity === 0) {
      get().removeFromCart(productId)
      return
    }

    await axios.put(`/cart/${productId}`, { quantity })

    set(pre => ({
      cart: pre.cart.map(item => (item._id === productId ? { ...item, quantity } : item))
    }))

    get().calculateTotals()
  },
  calculateTotals: () => {
    const { cart, coupon } = get()
    const subtotal = cart.reduce((sum, item) => sum + Number(item.price) * (item.quantity ?? 0), 0)
    let total = subtotal

    if (coupon) {
      const discount = subtotal * (coupon.discountPercentage / 100)
      total = subtotal - discount
    }

    set({ subtotal, total })
  }
}))