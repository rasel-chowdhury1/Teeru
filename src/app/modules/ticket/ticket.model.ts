import { Schema, model, Types } from 'mongoose';

type TTicketInfo = {
  ticketType: string;
  seat: number;
};

type TTicket = {
  userId: Types.ObjectId;
  eventId: Types.ObjectId;
  paymentId: Types.ObjectId;
  tickets: TTicketInfo[];
};

const ticketInfoSchema = new Schema<TTicketInfo>(
  {
    ticketType: { type: String, required: true },
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
      validate: [v => v.length > 0, 'At least one ticket must be provided'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export const Ticket = model<TTicket>('Ticket', ticketSchema);
