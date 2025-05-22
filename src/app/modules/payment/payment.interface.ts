import { Document, Schema } from 'mongoose';

// Define the possible payment types
export type PaymentType = 'booking' | 'subscription';

// Define the structure of a payment document
export interface IPayment extends Document {
  user_id: Schema.Types.ObjectId | null; // Null for subscription payments
  amount: number;
  paymentStatus: 'pending' | 'completed';
  transactionId: string;
  paymentMethod: 'paypal' | 'stripe' | 'Stripe' | 'Card' | 'Bank';
  ticketId: Schema.Types.ObjectId | null; // Only set for subscription payments
}
