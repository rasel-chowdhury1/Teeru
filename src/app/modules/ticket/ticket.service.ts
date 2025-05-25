import mongoose from 'mongoose';
import Payment from '../payment/payment.model';
import { Ticket } from './ticket.model';
import { BuyTicketInput } from './ticket.interface';
import { Types } from 'mongoose';
import AppError from '../../error/AppError';
import Notification from '../notifications/notifications.model';
import { getAdminId } from '../../DB/adminStore';
import { emitNotification } from '../../../socketIo';


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

    const updatePayment = await Payment.findByIdAndUpdate(newPayment[0]._id, {ticketId: newTicket[0]._id}, {new: true})


    const adminId = getAdminId()

   emitNotification( {userId: data.userId, 
      receiverId: adminId, 
      message: `${data.fullName} bought a ticket`,
      type: 'buyTicket',})

    return newTicket[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getUserTickets = async (userId: Types.ObjectId | string) => {
  const tickets = await Ticket.find({ userId })
    .populate({
      path: 'eventId',
      populate: {
        path: "category"
      }
    })   // Optional: populate event info
    .populate('paymentId') // Optional: populate payment info
    .sort({ createdAt: -1 }); // Newest first

  return tickets || [];
};

const getTicketById = async (ticketId: string) => {
  if (!ticketId) throw new AppError(httpStatus.BAD_REQUEST, "Ticket ID is required");

  const ticket = await Ticket.findById(ticketId).lean();

  if (!ticket) {
    throw new AppError(httpStatus.NOT_FOUND, "Ticket not found");
  }

  return ticket;
};

export const ticketServices = {
  buyTicket,
  getUserTickets,
  getTicketById
};
