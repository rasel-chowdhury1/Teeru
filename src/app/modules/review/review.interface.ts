import mongoose from "mongoose";

export interface IReview {
    userId: mongoose.ObjectId;
    rating: number;
    comment: string;
    isDeleted: boolean
  }