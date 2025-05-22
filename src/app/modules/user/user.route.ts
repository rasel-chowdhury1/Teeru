import { Router } from 'express';
import auth from '../../middleware/auth';
import fileUpload from '../../middleware/fileUpload';
import parseData from '../../middleware/parseData';
import validateRequest from '../../middleware/validateRequest';
import { resentOtpValidations } from '../otp/otp.validation';
import { userController } from './user.controller';
import { userValidation } from './user.validation';
const upload = fileUpload('./public/uploads/profile');

export const userRoutes = Router();

userRoutes
  .post(
    '/create',
    validateRequest(userValidation?.userValidationSchema),
    userController.createUser,
  )

  .post(
    '/create-user-verify-otp',
    validateRequest(resentOtpValidations.verifyOtpZodSchema),
    userController.userCreateVarification,
  )

  .post(
    "/addCard",
    auth("user"),
    userController.addCardToUser
  )

  .get("/myCards", auth('user'), userController.getMyCards)

  .get('/my-profile', auth('user', 'admin'), userController.getMyProfile)

  .get('/admin-profile', auth('admin'), userController.getAdminProfile)

  .get('/all-users', auth('admin'), userController.getAllUsers)

  .get('/all-users-overview', auth('admin'), userController.getAllUsersOverview)

  .get('/:id', auth('user', 'admin'), userController.getUserById)

  .patch(
    '/update-my-profile',
    auth('user', 'admin'),
    upload.fields([
      { name: 'profileImage', maxCount: 1 },
      { name: 'coverImage', maxCount: 1 },
    ]),
    parseData(),
    userController.updateMyProfile,
  )

  .patch('/block/:id', auth('admin'), userController.blockUser)
  
  .patch('/unblock/:id', auth('admin'), userController.unblockUser)

  .delete('/delete-my-account', auth('user'), userController.deleteMyAccount);

// export default userRoutes;
