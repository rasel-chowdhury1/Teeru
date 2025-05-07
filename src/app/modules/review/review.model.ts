import { Schema, model } from 'mongoose';
import { IReview } from './review.interface';

const ReviewSchema = new Schema<IReview>(
  {
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    rating: {
      type: Number,
      required: true,
    },
    comment: {
        type: String,
        required: true
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
  }
);

const Review = model<IReview>('Review', ReviewSchema);

export default Review;