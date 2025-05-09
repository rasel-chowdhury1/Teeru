import { Router } from "express";
import auth from "../../middleware/auth";
import { ReviewController } from "./review.controller";

export const reviewRoutes = Router();

reviewRoutes
 .post(
    "/add",
    auth("user"),
    ReviewController.createReview
 )

.get(
    "/",
    auth("admin"),
    ReviewController.getAllReviews
)

.get(
    "/:id",
    auth("admin"),
    ReviewController.getSpecificReview
)




  .delete(
    '/:id',
    auth('admin'),
    ReviewController.softDeleteReview
  ); // Soft delete event
