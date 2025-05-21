import { NextFunction, Request, Response } from "express"
import jwt from 'jsonwebtoken'
import { JwtToken } from "../types/JwtToken.js"
import { mongoUserType, User } from "../models/user.model.js"




export async function protectRoute (req: Request, res: Response, next: NextFunction) {
  try {
    const accessToken = req.cookies.accessToken

    if (!accessToken) {
      res.status(401).json({ message: 'Unauthorized - No access token provided' })
      return
    }

    try {
      const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!) as JwtToken
      const user = await User.findById(decoded.userId).select('-password') as mongoUserType

      if (!user) {
        res.status(401).json({ message: 'User not found' })
        return
      }

      req.user = user

      next()
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        res.status(401).json({ message: 'Unauthorized - Access token expired' })
        return
      }
      throw error
    }
  } catch (error: any) {
    console.log('Error in protectRoute middleware', error.message)

    res.status(401).json({ message: 'Unauthorized - Invalid access token' })
  }
}



export function adminRoute (req: Request, res: Response, next: NextFunction) {
  if (req.user && req.user.role === 'admin') {
    next()
  } else {
    res.status(403).json({ message: 'Access denied - Admin only' })
    return
  }
}