import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { reviewService } from "./review.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from 'http-status';

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
    const categories = await reviewService.getAllReviews(req.query);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Reviews fetched successfully',
      data: categories,
    });
  });


  const getSpecificReview = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const event = await reviewService.getSpecificReview(id);
  
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Review fetched successfully',
      data: event,
    });
  });
  
  
  const softDeleteReview = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const deleted = await reviewService.softDeleteReview(id);
  
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Review deleted successfully',
      data: deleted,
    });
  });
  

 export const ReviewController = {
    createReview,
    getAllReviews,
    getSpecificReview,
    softDeleteReview
 }