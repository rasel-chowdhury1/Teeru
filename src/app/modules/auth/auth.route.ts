import { Router } from 'express';
import { authControllers } from './auth.controller';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { authValidation } from './auth.validation';

export const authRoutes = Router();

authRoutes
  .post('/login', authControllers.login)
  .post(
    '/refresh-token',
    validateRequest(authValidation.refreshTokenValidationSchema),
    authControllers.refreshToken,
  )
  .post(
    '/forgot-password-otpByEmail',
    validateRequest(authValidation.forgetPasswordValidationSchemaByEmail),
    authControllers.forgotPassword,
  )

  .post(
    '/forgot-password-otpByNumber',
    validateRequest(authValidation.forgetPasswordValidationSchemaByNumber),
    authControllers.forgotPassword,
  )

  .patch(
    '/change-password',
    auth('user',"admin"),
    authControllers.changePassword,
  )

  .patch(
    '/forgot-password-otp-match',
    validateRequest(authValidation.otpMatchValidationSchema),
    authControllers.forgotPasswordOtpMatch,
  )
  .patch(
    '/forgot-password-reset',
    validateRequest(authValidation.resetPasswordValidationSchema),
    authControllers.resetPassword,
  );
