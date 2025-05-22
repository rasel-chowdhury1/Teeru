import mongoose, { Schema, Document } from 'mongoose';
import { IPayment } from './payment.interface';

const paymentSchema: Schema = new Schema<IPayment>(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    paymentMethod: {
      type: String,
      enum: ["Wave","OrangeMoney","Apple","Google", "Card", "Bank","stripe",],
      required: true,
    },
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      // default: null
    },
  },
  {
    timestamps: true,
  }
);

const Payment = mongoose.model<IPayment & Document>("Payment", paymentSchema);

export default Payment;