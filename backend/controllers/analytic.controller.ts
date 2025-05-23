import { Request, Response } from "express";
import { getAnalyticsData } from "../utils/getAnalyticsData.js";
import { getDailySalesData } from "../utils/getDailySalesData.js";



export async function analyticsInfo (req: Request, res: Response) {
  try {
    const analyticsData = await getAnalyticsData()

    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000)

    const dailySalesData = await getDailySalesData(startDate, endDate)

    res.json({
      analyticsData,
      dailySalesData
    })
  } catch (error: any) {
    console.log('Error in getAnalytics controller', error.message)

    res.status(500).json({ message: 'Server error', error: error.message })
  }
}