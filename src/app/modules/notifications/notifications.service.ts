
import AppError from '../../error/AppError';
import httpStatus from 'http-status';
import Notification from './notifications.model';

interface ICreateNotificationProps {
  userId: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

const createNotification = async ({
  userId,
  message,
  type,
}: ICreateNotificationProps) => {
  const newNotification = new Notification({
    userId,
    message,
    type,
    isRead: false,
  });

  await newNotification.save();
  return newNotification;
};

const getAllNotifications = async (query: Record<string, unknown>) => {
  // You can implement a query builder like in your `userService` for pagination, filtering, etc.
  const notifications = await Notification.find(query);
  return notifications;
};

const getMyNotifications = async (userId: string) => {
  const notifications = await Notification.find({ receiverId: userId }).sort({ createdAt: -1 });
  return notifications;
};

const markAsRead = async (id: string) => {
  const notification = await Notification.findByIdAndUpdate(
    id,
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    throw new AppError(httpStatus.NOT_FOUND, 'Notification not found');
  }

  return notification;
};

const markAllAsRead = async (receiverId: string) => {
  const result = await Notification.updateMany(
    { receiverId, isRead: false }, // Only update unread notifications
    { $set: { isRead: true } }
  );

  if (result.modifiedCount === 0) {
    throw new AppError(httpStatus.NOT_FOUND, 'No unread notifications found');
  }

  return;
};

const deleteNotification = async (id: string) => {
  const notification = await Notification.findByIdAndDelete(id);

  if (!notification) {
    throw new AppError(httpStatus.NOT_FOUND, 'Notification not found');
  }

  return ;
};

export const notificationService = {
  createNotification,
  getAllNotifications,
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
