import mongoose, { HydratedDocument, InferSchemaType } from "mongoose"



const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  discountPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  expirationDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  }
}, {
  timestamps: true
})



export type couponType = InferSchemaType<typeof couponSchema>


export type mongoCouponType = HydratedDocument<couponType>



export const Coupon = mongoose.model('Coupon', couponSchema)