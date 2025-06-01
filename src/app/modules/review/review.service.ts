import QueryBuilder from "../../builder/QueryBuilder";
import AppError from "../../error/AppError";
import { IReview } from "./review.interface";
import Review from "./review.model";
import httpStatus from 'http-status';

const createReview = async (data: IReview) => {
    
    // Create a new category
    const newReview = new Review(data);
    await newReview.save();
    return newReview;
  };

  const getAllReviews = async(query: Record<string, unknown>) => {
    const reviewQuery = new QueryBuilder(Review.find({ isDeleted: false }).populate("userId", 'fullName email profileImage'), query)
      .search([]) // Add searchable fields if needed
      .filter()
      .sort()
      .paginate()
      .fields();

    const result = await reviewQuery.modelQuery;
    const meta = await reviewQuery.countTotal();
    return { meta, result }
  }

  const getSpecificReview = async (id: string) => {
    const event = await Review.findById(id);
    if (!event || event.isDeleted) {
      throw new AppError(httpStatus.NOT_FOUND, 'Review not found');
    }
    return event;
  };
  
  const softDeleteReview = async (id: string) => {
    const event = await Review.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    if (!event) {
      throw new AppError(httpStatus.NOT_FOUND, 'Review not found');
    }
    return null;
  };


  export const reviewService = {
    createReview,
    getAllReviews,
    getSpecificReview,
    softDeleteReview
  }