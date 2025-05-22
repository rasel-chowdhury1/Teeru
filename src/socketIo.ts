import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import express, { Application } from "express";
import httpStatus from "http-status";
import AppError from "./app/error/AppError";
import { verifyToken } from "./app/utils/tokenManage";
import config from "./app/config";
import { User } from "./app/modules/user/user.models";
import mongoose from "mongoose";
import Notification from "./app/modules/notifications/notifications.model";
import colors from 'colors';
import { callbackFn } from "./app/utils/callbackFn";

// Define the socket server port
const socketPort: number = parseInt(process.env.SOCKET_PORT || "9020", 10);

const app: Application = express();

declare module "socket.io" {
  interface Socket {
    user?: {
      _id: string;
      name: string;
      email: string;
      role: string;
    };
  }
}

// Initialize the Socket.IO server
let io: SocketIOServer;

export const connectedUsers = new Map<
  string,
  {
    socketID: string;
  }
>();


console.log("connectedUsers ---->>> ", connectedUsers)



export const initSocketIO = async (server: HttpServer): Promise<void> => {
  console.log("🔧 Initializing Socket.IO server 🔧");

  const { Server } = await import("socket.io");

  io = new Server(server, {
    cors: {
      origin: "*", // Replace with your client's origin
      methods: ["GET", "POST"],
      allowedHeaders: ["my-custom-header"], // Add any custom headers if needed
      credentials: true,
    },
  });

  console.log("🎉 Socket.IO server initialized! 🎉");
      // Start the HTTP server on the specified port
      server.listen(socketPort, () => {
        console.log(
                colors.green(`Socket is listening on ${config.ip}:${socketPort}`).bold,
              );
        
      });

  // Authentication middleware: now takes the token from headers.
  io.use(async (socket: Socket, next: (err?: any) => void) => {
    // Extract token from headers (ensure your client sends it in headers)
    const token =
      (socket.handshake.auth.token as string) ||
      (socket.handshake.headers.token as string) ||
      (socket.handshake.headers.authorization as string);

    if (!token) {
      return next(
        new AppError(
          httpStatus.UNAUTHORIZED,
          "Authentication error: Token missing",
        ),
      );
    }

    const userDetails = verifyToken({token, access_secret: config.jwt_access_secret as string});


    if (!userDetails) {
      return next(new Error("Authentication error: Invalid token"));
    }

    const user = await User.findById(userDetails.userId);
    if (!user) {
      return next(new Error("Authentication error: User not found"));
    }

    socket.user = {
        _id: user._id.toString(), // Convert _id to string if necessary
        name: user.fullName as string,
        email: user.email,
        role: user.role,
      };;
    next();
  });


   io.on("connection", (socket: Socket) => {
    
    // =================== try catch 1 start ================
    try {
          // Automatically register the connected user to avoid missing the "userConnected" event.
    if (socket.user && socket.user._id) {
      connectedUsers.set(socket.user._id.toString(), { socketID: socket.id });
      console.log(
        `Registered user ${socket.user._id.toString()} with socket ID: ${socket.id}`,
      );
    }

    // (Optional) In addition to auto-registering, you can still listen for a "userConnected" event if needed.
    socket.on("userConnected", ({ userId }: { userId: string }) => {
      connectedUsers.set(userId, { socketID: socket.id });
      console.log(`User ${userId} connected with socket ID: ${socket.id}`);
    });

      //----------------------online array send for front end------------------------//
      io.emit('onlineUser', Array.from(connectedUsers));

      // ===================== join by user id ================================
      // socket.join(user?._id?.toString());



      
      //-----------------------Disconnect functionlity start ------------------------//
      socket.on("disconnect", () => {
        console.log(
          `${socket.user?.name} || ${socket.user?.email} || ${socket.user?._id} just disconnected with socket ID: ${socket.id}`,
        );
  
        // Remove user from connectedUsers map
        for (const [key, value] of connectedUsers.entries()) {
          if (value.socketID === socket.id) {

            connectedUsers.delete(key);
            break;
          }
        }

        io.emit('onlineUser', Array.from(connectedUsers));
      });
      //-----------------------Disconnect functionlity end ------------------------//
      
    } catch (error) {

      console.error('-- socket.io connection error --', error);

      // throw new Error(error)
      //-----------------------Disconnect functionlity start ------------------------//
      socket.on("disconnect", () => {
        console.log(
          `${socket.user?.name} || ${socket.user?.email} || ${socket.user?._id} just disconnected with socket ID: ${socket.id}`,
        );
  
        // Remove user from connectedUsers map
        for (const [key, value] of connectedUsers.entries()) {
          if (value.socketID === socket.id) {
            connectedUsers.delete(key);
            break;
          }
        }
        io.emit('onlineUser', Array.from(connectedUsers));
      });
      //-----------------------Disconnect functionlity end ------------------------//
    }
    // ==================== try catch 1 end ==================== //
  });


  
};

// Export the Socket.IO instance
export { io };




export const emitNotification = async ({
  userId,
  receiverId,
  message,
  type
}: {
  userId: any;
  receiverId: mongoose.Types.ObjectId;
  message: string;
  type: string;
}): Promise<void> => {

  if (!io) {
    throw new Error("Socket.IO is not initialized");
  }

  // Get the socket ID of the specific user
  const userSocket = connectedUsers.get(receiverId.toString());

  // Fetch unread notifications count for the receiver before creating the new notification
  const unreadCount = await Notification.countDocuments({
    receiverId: receiverId,
    isRead: false,  // Filter by unread notifications
  });


  console.log("userSocket ------>>>> ", userSocket);
  console.log("connected ---->>> ", connectedUsers)

  // Notify the specific user
  if (message && userSocket) {

    console.log()
    io.to(userSocket.socketID).emit(`notification`, {
      // userId,
      // message: userMsg,
      statusCode: 200,
      success: true,
      unreadCount: unreadCount >= 0 ? unreadCount + 1 : 1,
    });
  }

   // Save notification to the database
   const newNotification = {
    userId, // Ensure that userId is of type mongoose.Types.ObjectId
    receiverId, // Ensure that receiverId is of type mongoose.Types.ObjectId
    message: message,
    type, // Use the provided type (default to "FollowRequest")
    isRead: false, // Set to false since the notification is unread initially
    timestamp: new Date(), // Timestamp of when the notification is created
  };

    // Save notification to the database
   const result = await Notification.create(newNotification);
   console.log({result})


 
};

