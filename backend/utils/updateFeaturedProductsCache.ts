import { redis } from "../lib/redis.js";
import { Product } from "../models/product.model.js";

export async function updateFeaturedProductsCache() {
  try {
    const featuredProducts = await Product.find({ isFeatured: true }).lean()

    await redis.set('featured_products', JSON.stringify(featuredProducts))
  } catch (error) {
    console.log('error in update cache function')
  }
}