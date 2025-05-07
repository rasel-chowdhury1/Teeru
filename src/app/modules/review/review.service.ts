import { IReview } from "./review.interface";
import Review from "./review.model";

const createReview = async (data: IReview) => {
    
    // Create a new category
    const newReview = new Review(data);
    await newReview.save();
    return newReview;
  };

  const getAllReviews = async() => {
    
  }


  export const reviewService = {
    createReview
  }