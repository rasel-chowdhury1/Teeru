import { Schema, model } from 'mongoose';
import { TTicket, TTicketInfo } from './ticket.interface';



const ticketInfoSchema = new Schema<TTicketInfo>(
  {
    type: { type: String, required: true },
    seat: { type: Number, required: true },
  },
  { _id: false }
);

const ticketSchema = new Schema<TTicket>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment', required: true },
    tickets: {
      type: [ticketInfoSchema],
      required: true,
      validate: [(v: TTicketInfo[]) => v.length > 0, 'At least one ticket must be provided'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export const Ticket = model<TTicket>('Ticket', ticketSchema);
