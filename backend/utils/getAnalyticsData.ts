import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { User } from "../models/user.model.js";



export async function getAnalyticsData () {
  const totalUsers = await User.countDocuments()
  const totalProducts = await Product.countDocuments()

  const salesData = await Order.aggregate([
    {
      $group: {
        _id: null,
        totalSales: { $sum: 1 },
        totalRevenue: { $sum: '$totalAmount' }
      }
    }
  ])


  const { totalSales, totalRevenue } = salesData[0] || { totalSales: 0, totalRevenue: 0}

  return {
    users: totalUsers,
    products: totalProducts,
    totalSales,
    totalRevenue
  }
}