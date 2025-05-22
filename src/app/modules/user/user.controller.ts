import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { userService } from './user.service';

import httpStatus from 'http-status';
import { storeFile, storeFiles } from '../../utils/fileHelper';

const createUser = catchAsync(async (req: Request, res: Response) => {
  console.log(req.body);
  const createUserToken = await userService.createUserToken(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Check email for OTP',
    data: { createUserToken },
  });
});

const userCreateVarification = catchAsync(async (req, res) => {
  console.log('..........1..........');
  const token = req.headers?.token as string;
  console.log('token', token);
  const { otp } = req.body;
  console.log('otp', otp);
  const newUser = await userService.otpVerifyAndCreateUser({ otp, token });

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User create successfully',
    data: newUser,
  });
});

const completedProfile = catchAsync(async (req: Request, res: Response) => {
  if (req?.file) {
    req.body.profileImage = storeFile('profile', req?.file?.filename);
  }

  const result = await userService.completedUser(req?.user?.userId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'profile completed successfully',
    data: result,
  });
});

const addCardToUser = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;  // Get the userId from the request (assumes user is authenticated)
  const newCard = req.body;      // Get the new card data from the request body

  console.log("new card data -->>> ",{newCard})
  // Call the service function to handle the logic for adding the card
  const result = await userService.addUniqueCardToUser(userId, newCard);

  // Send the response back to the client
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Card added successfully',
    data: result,
  });
});

const getMyCards = catchAsync(async (req: Request, res: Response) => {
  console.log('get my profile ->>> ', req?.user?.userId);
  const result = await userService.getMyCards(req?.user?.userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User card fetched successfully',
    data: result,
  });
});

// rest >...............

const getAllUsers = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const result = await userService.getAllUserQuery(userId, req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    meta: result.meta,
    data: result.result,
    message: 'Users All are requered successful!!',
  });
});

const getUserById = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.getUserById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User fetched successfully',
    data: result,
  });
});

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  console.log('get my profile ->>> ', req?.user?.userId);
  const result = await userService.getMyProfile(req?.user?.userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'profile fetched successfully',
    data: result,
  });
});

const getAdminProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.getAdminProfile(req?.user?.userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'profile fetched successfully',
    data: result,
  });
});

const getAllUsersOverview = catchAsync(async (req, res) => {
  console.log('get all user overviewo _>>>> ');
  const { userId } = req.user;
  // Default to the current year if the 'year' query parameter is not provided
  const year = req.query.year
    ? parseInt(req.query.year as string)
    : new Date().getFullYear();

  // Ensure the year is valid
  if (isNaN(year)) {
    sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: 'Invalid year parameter.',
      data: null,
    });
  }

  const result = await userService.getUsersOverview(userId, year);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'get all User overview fetched successfully',
    data: result,
  });
});

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {

    // Check if there are uploaded files
    if (req.files) {
      try {
        // Use storeFiles to process all uploaded files
        const filePaths = storeFiles(
          'profile',
          req.files as { [fieldName: string]: Express.Multer.File[] },
        );
  
        // Set image (single file)
        if (filePaths.profileImage && filePaths.profileImage.length > 0) {
          req.body.profileImage = filePaths.profileImage[0]; // Assign first image
        }
  
        // Set photos (multiple files)
        if (filePaths.coverImage && filePaths.coverImage.length > 0) {
          req.body.coverImage = filePaths.coverImage[0]; // Assign full array of photos
        }
  
  
      } catch (error: any) {
        console.error('Error processing files:', error.message);
        return sendResponse(res, {
          statusCode: httpStatus.BAD_REQUEST,
          success: false,
          message: 'Failed to process uploaded files',
          data: null,
        });
      }
    }

  const result = await userService.updateUser(req?.user?.userId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'profile updated successfully',
    data: result,
  });
});

const blockUser = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.blockUser(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `User blocked  successfully`,
    data: null,
  });
});

const unblockUser = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.unblockUser(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `User unblocked  successfully`,
    data: null,
  });
});

const deleteMyAccount = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.deleteMyAccount(req.user?.userId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User deleted successfully',
    data: result,
  });
});

export const userController = {
  createUser,
  userCreateVarification,
  completedProfile,
  addCardToUser,
  getMyCards,
  getUserById,
  getMyProfile,
  getAdminProfile,
  updateMyProfile,
  blockUser,
  unblockUser,
  deleteMyAccount,
  getAllUsers,
  getAllUsersOverview,
};
