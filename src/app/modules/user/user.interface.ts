import { Model } from 'mongoose';

// user.interface.ts
export type TCard = {
  cardHolderName: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardBrand?: string;
};

export interface TUserCreate {
  fullName?: string;
  email: string;
  password: string;
  profileImage?: string;
  coverImage?: string;
  address?: string;
  about?: string;
  dateOfBirth?: Date;
  isBlocked: boolean;
  isDeleted: boolean;
  role: string;
  phone: string;
  gender: 'male' | 'female' | 'other';
    cards?: TCard[]; // <- Add this line
}

export interface TUser extends TUserCreate {
  _id: string;
}

export interface DeleteAccountPayload {
  password: string;
}

export interface UserModel extends Model<TUser> {
  isUserExist(email: string): Promise<TUser>;

  isUserActive(email: string): Promise<TUser>;

  IsUserExistById(id: string): Promise<TUser>;

  isPasswordMatched(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean>;
}

export type IPaginationOption = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};
