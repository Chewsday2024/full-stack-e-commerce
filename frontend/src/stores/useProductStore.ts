import { create } from 'zustand'
import axios from '../lib/axios'
import toast from 'react-hot-toast'
import { AxiosError } from 'axios'
import type { productType } from '../types/productType'




type productStoreType = {
  products: productType[]
  loading: boolean
  setProducts: ( products: productType[] ) => void
  createProduct: ( productData: productType ) => Promise<void>
  fetchAllProducts: () => Promise<void>
  fetchProductsByCategory: ( category: string ) => Promise<void>
  deleteProduct: ( productId: string ) => Promise<void>
  toggleFeaturedProduct: ( productId: string ) => Promise<void>
  fetchFeaturedProducts: () => Promise<void>
}


export const useProductStore = create<productStoreType>(set => ({
  products: [],
  loading: false,
  setProducts: ( products ) => set({ products }),
  createProduct: async ( productData ) => {
    set({ loading: true })
    try {
      const res = await axios.post('/products', productData)
      set(pre => ({
        products: [...pre.products, res.data],
        loading: false
      }))
    } catch (error) {
      if (error instanceof AxiosError) toast.error(error.response?.data.error)
      set({ loading: false })
    }
  },
  fetchAllProducts: async () => {
    set({ loading: true })
    try {
      const res = await axios.get('/products')
      set({ products: res.data.products, loading: false })
    } catch (error) {
      set({ loading: false })
      if (error instanceof AxiosError) toast.error(error.response?.data.error || 'Failed to fetch products')
    }
  },
  fetchProductsByCategory: async ( category ) => {
    set({ loading: true })
    try {
      const res = await axios.get(`/products/category/${category}`)
      set({ products: res.data.products, loading: false })
    } catch (error) {
      set({ loading: false })

      if (error instanceof AxiosError) toast.error(error.response?.data.error || 'Failed to fetch products')
    }
  },
  deleteProduct: async ( productId ) => {
    set({ loading: true })
    try {
      await axios.delete(`/products/${productId}`)
      set(pre => ({
        products: pre.products.filter(product => product._id?.toString() !== productId),
        loading: false
      }))
    } catch (error) {
      set({ loading: false })

      if (error instanceof AxiosError) toast.error(error.response?.data.error || 'Failed to delete product')
    }
  },
  toggleFeaturedProduct: async ( productId ) => {
    set({ loading: true })
    try {
      const res = await axios.patch(`/products/${productId}`)

      set(pre => ({
        products: pre.products.map(product => 
          product._id?.toString() === productId ? {...product, isFeatured: res.data.isFeatured} : product
        ),
        loading: false
      }))
    } catch (error) {
      set({ loading: false })

      if (error instanceof AxiosError) toast.error(error.response?.data.error || 'Failed to update product')
    }
  },
  fetchFeaturedProducts: async () => {
    set({ loading: true })

    try {
      const res = await axios.get('/products/featured')
      set({ products: res.data, loading: false })
    } catch (error) {
      console.error('Error fetching featured products:', error)
    }
  }
}))