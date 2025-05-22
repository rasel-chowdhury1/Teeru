import { Schema } from "mongoose";


export interface INotification {
    userId: Schema.Types.ObjectId; // Reference to User
    receiverId: Schema.Types.ObjectId; // Reference to User
    message: string;
    type: "Join" | "buyTicket"; // Type of notification
    isRead: boolean; // Whether the notification is read
    
  }