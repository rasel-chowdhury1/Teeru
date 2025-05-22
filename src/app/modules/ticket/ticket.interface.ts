import mongoose, { Types } from "mongoose";

export type TTicketInfo = {
  type: string;
  seat: number;
};

export type TTicket = {
  userId: Types.ObjectId;
  eventId: Types.ObjectId;
  paymentId: Types.ObjectId;
  tickets: TTicketInfo[];
};


export type BuyTicketInput = {
  fullName: string;
  userId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  amount: number;
  transactionId: string;
  paymentMethod: 'Wave' | 'OrangeMoney' | 'Apple' | 'Google' | 'Card' | 'Bank' | 'stripe';
  tickets: TTicketInfo[];
};