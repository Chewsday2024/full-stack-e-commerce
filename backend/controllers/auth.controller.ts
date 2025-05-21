import { Request, Response } from "express"
import jwt from 'jsonwebtoken'

import { storeRefreshToken } from "../utils/storeRefreshToken.js"
import { generateTokens } from "../utils/generateTokens.js"
import { mongoUserType, User, userType } from "../models/user.model.js"
import { setCookies } from "../utils/setCookies.js"
import { redis } from "../lib/redis.js"


import { JwtToken } from "../types/JwtToken.js"




export async function signup (req: Request, res: Response) {
  const { name, email, password }: userType = req.body

  try {
    const userExists = await User.findOne({ email })
  
    if (userExists) {
      res.status(400).json({ message: 'User already exists' })
      return
    }
  
    const user = await User.create({ name, email, password })

    const { accessToken, refreshToken } = generateTokens(user._id.toString())
    await storeRefreshToken(user._id.toString(), refreshToken)


    setCookies(res, accessToken, refreshToken)


  
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    })
    
  } catch (error: any) {
    console.log('Error in signup controller', error.message)

    res.status(500).json({ message: error.message })
  }
}


export async function login (req: Request, res: Response) {
  try {
    const { email, password }: userType = req.body
    const user = await User.findOne({ email }) as mongoUserType

    if (user && (await user.comparePassword(password))) {
      const { accessToken, refreshToken } = generateTokens(user._id.toString())

      await storeRefreshToken(user._id.toString(), refreshToken)
      setCookies(res, accessToken, refreshToken)

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      })
    } else {
      res.status(401).json({ message: 'Invalid email or password' })
    }
  } catch (error: any) {
    console.log('Error in login controller', error.message)

    res.status(500).json({ message: error.message})
  }
}


export async function logout (req: Request, res: Response) {
  try {
    const refreshToken = req.cookies.refreshToken
    if (refreshToken) {
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as JwtToken
      await redis.del(`refresh_token: ${decoded.userId}`)
    }

    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')
    res.json({ message: 'Logged out successfully' })
  } catch (error: any) {
    console.log('Error in logout controller', error.message)

    res.status(500).json({ message: 'Server error', error: error.message })
  }
}


export async function refreshToken (req: Request, res: Response) {
  try {
    const refreshToken = req.cookies.refreshToken
    if (!refreshToken) {
      res.status(401).json({ message: 'No refresh token provided' })
      return
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as JwtToken

    const storedToken = await redis.get(`refresh_token: ${decoded.userId}`)

    if (storedToken !== refreshToken) {
      res.status(401).json({ message: 'Invalid refresh token' })
      return
    }

    const accessToken = jwt.sign({ userId: decoded.userId }, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '15m' })

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000
    })
   
    res.json({ message: 'Token refreshed successfully' })
  } catch (error: any) {
    console.log('Error in refreshToken controller', error.message)

    res.status(500).json({ message: 'Server error', error: error.message })
  }
}