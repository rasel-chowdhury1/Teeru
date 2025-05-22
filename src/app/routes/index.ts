import { Router } from "express";
import { userRoutes } from "../modules/user/user.route";
import { authRoutes } from "../modules/auth/auth.route";
import { otpRoutes } from "../modules/otp/otp.routes";
import { settingsRoutes } from "../modules/setting/setting.route";
import { notificationRoutes } from "../modules/notifications/notifications.route";
import { categoryRoutes } from "../modules/category/category.route";
import { eventRoutes } from "../modules/event/event.route";
import { reviewRoutes } from "../modules/review/review.route";
import { ticketRoutes } from "../modules/ticket/ticket.route";
import { paymentRoutes } from "../modules/payment/payment.route";

const router = Router();

const moduleRoutes = [
  {
    path: '/users',
    route: userRoutes,
  },
  {
    path: '/auth',
    route: authRoutes,
  },
  {
    path: "/otp",
    route: otpRoutes
  },
  {
    path: "/settings",
    route: settingsRoutes
  },
  {
     path: "/notifications",
     route: notificationRoutes
  }, 
  {
    path: "/category",
    route: categoryRoutes
 },
 {
  path: "/event",
  route: eventRoutes
},

{
  path: "/review",
  route: reviewRoutes
},
{
  path: "/ticket",
  route: ticketRoutes
},
{
  path: "/earnings",
  route: paymentRoutes
}
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;