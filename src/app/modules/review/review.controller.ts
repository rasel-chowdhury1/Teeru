import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { reviewService } from "./review.service";
import sendResponse from "../../utils/sendResponse";

const createReview = catchAsync(async (req: Request, res: Response) => {
      req.body.userId = req.user.userId;
      req.body.isDeleted = false;
  
    const newReview = await reviewService.createReview(req.body);
  
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: 'Review created successfully',
      data: newReview,
    });
  });

  const getAllReviews = catchAsync(async (req: Request, res: Response) => {
    const categories = await reviewService.getAllCategories(req.query);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Categories fetched successfully',
      data: categories,
    });
  });
  

 export const ReviewController = {
    createReview,
    getAllReviews
 }