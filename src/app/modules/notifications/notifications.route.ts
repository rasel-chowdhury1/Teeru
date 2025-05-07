import { Router } from 'express';
import auth from '../../middleware/auth';
import { notificationController } from './notifications.controller';
import { otpControllers } from '../otp/otp.controller';

export const notificationRoutes = Router();



notificationRoutes
  .post(
    "/create",
    auth('user', "admin"),
    notificationController.createNotification
  )
  .get(
    '/all-notifications', 
    auth('user'), 
    notificationController.getAllNotifications
  )

  .get(
    '/my-notifications', 
    auth('user', 'admin'), 
    notificationController.getMyNotifications
  )

  .patch(
    '/mark-read/:id', 
    auth('user'), 
    notificationController.markAsRead
  )

  .patch(
    "/read-all", 
    auth("user", "admin"), 
    notificationController.markAllAsRead
  )

  
  .delete(
    '/delete/:id', 
    auth('user'), 
    notificationController.deleteNotification
  );
