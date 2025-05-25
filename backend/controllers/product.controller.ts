import { Request, Response } from "express"

import cloudinary from "../lib/cloudinary.js"
import { redis } from "../lib/redis.js"

import { updateFeaturedProductsCache } from "../utils/updateFeaturedProductsCache.js"
import { Product, productType } from "../models/product.model.js"



export async function getAllProducts (req: Request, res: Response) {
  try {
    const products = await Product.find({})

    res.json({ products })
  } catch (error: any) {
    console.log('Error in getAllProducts controller', error.message)

    res.status(500).json({ message: 'Server error', error: error.message })
  }
}


export async function getFeaturedProducts (req: Request, res: Response) {
  try {
    const featuredProductsInRedis = await redis.get('featured_products')

    if (featuredProductsInRedis) {
      res.json(JSON.parse(featuredProductsInRedis))
      return
    }

    const featuredProductsInMongoDB = await Product.find({ isFeatured: true }).lean()

    if (!featuredProductsInMongoDB) {
      res.status(404).json({ message: 'No featured products found' })
      return
    }

    await redis.set('featured_products', JSON.stringify(featuredProductsInMongoDB))

    res.json(featuredProductsInMongoDB)
  } catch (error: any) {
    console.log('Error in getFeaturedProducts controller', error.message)

    res.status(500).json({ message: 'Server error', error: error.message })
  }
}


export async function createProduct (req: Request, res: Response) {
  try {
    const { name, description, price, image, category }: productType = req.body

    let cloudinaryResponse = null

    if (image) {
      cloudinaryResponse = await cloudinary.uploader.upload(image, { folder: 'products' })
    }

    const product = await Product.create({
      name,
      description,
      price,
      image: cloudinaryResponse?.secure_url ? cloudinaryResponse.secure_url : '',
      category
    })

    res.status(201).json(product)
  } catch (error: any) {
    console.log('Error in createProduct controller', error.message)

    res.status(500).json({ message: 'Server error', error: error.message })
  }
}


export async function deletProduct (req: Request, res: Response) {
  try {
    const product = await Product.findById(req.params.id)

    if (!product) {
      res.status(404).json({ message: 'Product not found' })
      return
    }

    if (product.image) {
      const publicId = product.image.split('/').pop()?.split('.')[0]

      try {
        await cloudinary.uploader.destroy(`product/${publicId}`)
        console.log('deleted image from cloudinary')
      } catch (error) {
        console.log('error deleting image from cloudinary', error)
      }
    }

    await Product.findByIdAndDelete(req.params.id)

    res.json({ message: 'Product deleted successfully' })
  } catch (error: any) {
    console.log('Error in deletProduct controller', error.message)

    res.status(500).json({ message: 'Server error', error: error.message })
  }
}


export async function getCommendedProducts (req: Request, res: Response) {
  try {
    const porducts = await Product.aggregate([
      {
        $sample: { size: 3 }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          image: 1,
          price: 1
        }
      }
    ])

    res.json(porducts)
  } catch (error: any) {
    console.log('Error in getCommendedProducts controller', error.message)

    res.status(500).json({ message: 'Server error', error: error.message })
  }
}


export async function getProductsByCategory (req: Request, res: Response) {
  const { category } = req.params
  try {
    const products = await Product.find({ category })

    res.json({ products })
  } catch (error: any) {
    console.log('Error in getProductsByCategory controller', error.message)

    res.status(500).json({ message: 'Server error', error: error.message })
  }
}


export async function toggleFeaturedProduct (req: Request, res: Response) {
  try {
    const product = await Product.findById(req.params.id)
    if (product) {
      product.isFeatured = !product.isFeatured
      const updatedProduct = await product.save()
      await updateFeaturedProductsCache()
      res.json(updatedProduct)
    } else {
      res.status(404).json({ message: 'Product not found' })
    }
  } catch (error: any) {
    console.log('Error in toggleFeaturedProduct controller', error.message)

    res.status(500).json({ message: 'Server error', error: error.message })
  }
}