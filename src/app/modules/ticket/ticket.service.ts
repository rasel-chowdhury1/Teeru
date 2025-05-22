import mongoose from 'mongoose';
import Payment from '../payment/payment.model';
import { Ticket } from './ticket.model';
import { BuyTicketInput } from './ticket.interface';
import { Types } from 'mongoose';


const buyTicket = async (data: BuyTicketInput) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Create Payment
    const paymentData = {
      user_id: data.userId,
      amount: data.amount,
      paymentStatus: 'completed',
      transactionId: data.transactionId,
      paymentMethod: data.paymentMethod,
    };

    const newPayment = await Payment.create([paymentData], { session });

    // 2. Create Ticket
    const ticketData = {
      userId: data.userId,
      eventId: data.eventId,
      paymentId: newPayment[0]._id,
      tickets: data.tickets,
    };

    const newTicket = await Ticket.create([ticketData], { session });

    // 3. Commit transaction
    await session.commitTransaction();
    session.endSession();

    return newTicket[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getUserTickets = async (userId: Types.ObjectId | string) => {
  const tickets = await Ticket.find({ userId })
    .populate('eventId')   // Optional: populate event info
    .populate('paymentId') // Optional: populate payment info
    .sort({ createdAt: -1 }); // Newest first

  return tickets || [];
};

export const ticketServices = {
  buyTicket,
  getUserTickets
};
