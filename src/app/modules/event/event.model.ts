import { Schema, model } from 'mongoose';
import { IEvent } from './event.interface';



const EventSchema = new Schema<IEvent>(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
      },      
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    ticketPrices: {
      tribune: { type: Number, default: 0 },
      annexeLoge: { type: Number, default: 0 },
      logeVIP: { type: Number, default: 0 },
      logeVVIP: { type: Number, default: 0 },
      serviceFee: { type: Number, default: 0 },
      processingFee: { type: Number, default: 0 },
    },
    isDeleted: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true,
  }
);

const Event = model<IEvent>('Event', EventSchema);

export default Event;