import { JwtPayload } from "jsonwebtoken";
import mongoose from "mongoose";


export interface JwtToken extends JwtPayload {
  userId: string | mongoose.Types.ObjectId
}