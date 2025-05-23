import 'stripe'

declare module 'stripe' {
  interface Metadata {
    userId?: string
    couponCode?: string
    products?: {
      id: string
      quantity: number
      price: number
    }
  }
}