import { Schema, model } from 'mongoose';
import { INotification } from './notifications.interface';


const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Reference to the User model
      required: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Reference to the User model
      required: true,
    },
    message: {
      type: {
        fullName: {type: String, default: false},
        image: { type: String, default: "" }, // Store the image URL or path
        text: { type: String, required: true },  // Store additional data
        photos: { type: [String], default: [] }, // Optional array of photo URLs or paths
      },
      required: true, // The message object itself is required
    },
    type: {
      type: String,
      enum: ["interested", "notInterested","SendFollow", "AcceptFollow", "DeclineFollow", "Accepted", "Rejected", "added"],
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Create and export the Notification model
const Notification = model<INotification>('Notification', NotificationSchema);

export default Notification;