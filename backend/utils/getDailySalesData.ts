import { Order } from "../models/order.model.js";
import { getDatesInRange } from "./getDatesInRange.js";




export async function getDailySalesData (startDate: Date, endDate: Date) {
  try {
    const dailySalesData = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          sales: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ])

    const dateArray = getDatesInRange(startDate, endDate)

    return dateArray.map(date => {
      const foundData = dailySalesData.find(item => item._id === date)

      return {
        date,
        sales: foundData?.sales || 0,
        revenue: foundData?.revenue || 0
      }
    })
  } catch (error) {
    throw error
  }
}