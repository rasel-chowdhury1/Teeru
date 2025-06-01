/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import config from '../../config';
import AppError from '../../error/AppError';
import { otpSendEmail } from '../../utils/eamilNotifiacation';
import { createToken, verifyToken } from '../../utils/tokenManage';
import Notification from '../notifications/notifications.model';
import { TPurposeType } from '../otp/otp.interface';
import { otpServices } from '../otp/otp.service';
import { generateOptAndExpireTime } from '../otp/otp.utils';
import { DeleteAccountPayload, TCard, TUser, TUserCreate } from './user.interface';
import { User } from './user.models';
import Payment from '../payment/payment.model';
import { monthNameSwitch } from './user.utils';
import { getAdminId } from '../../DB/adminStore';
import { emitNotification } from '../../../socketIo';

export type IFilter = {
  searchTerm?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

export interface OTPVerifyAndCreateUserProps {
  otp: string;
  token: string;
}

const createUserToken = async (payload: TUserCreate) => {
  console.log('payload service user');

  const { email, fullName, password, phone, gender } = payload;

  // user exist check
  const userExist = await userService.getUserByEmail(email);

  if (userExist) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User already exist!!');
  }

  const { isExist, isExpireOtp } = await otpServices.checkOtpByEmail(email);

  const { otp, expiredAt } = generateOptAndExpireTime();

  let otpPurpose: TPurposeType = 'email-verification';

  if (isExist && !isExpireOtp) {
    throw new AppError(httpStatus.BAD_REQUEST, 'otp-exist. Check your email.');
  } else if (isExist && isExpireOtp) {
    const otpUpdateData = {
      otp,
      expiredAt,
    };

    await otpServices.updateOtpByEmail(email, otpUpdateData);
  } else if (!isExist) {
    await otpServices.createOtp({
      name: 'Customer',
      sentTo: email,
      receiverType: 'email',
      purpose: otpPurpose,
      otp,
      expiredAt,
    });
  }

  const otpBody: Partial<TUserCreate> = {
    email,
    fullName,
    password,
    phone,
    gender,
  };

  // send email
  console.log('before otp send email');
  process.nextTick(async () => {
    await otpSendEmail({
      sentTo: email,
      subject: 'Your one time otp for email  verification',
      name: 'Customer',
      otp,
      expiredAt: expiredAt,
    });
  });
  console.log('after otp send email');

  // crete token
  const createUserToken = createToken({
    payload: otpBody,
    access_secret: config.jwt_access_secret as string,
    expity_time: config.otp_token_expire_time as string | number,
  });

  return createUserToken;
};

const otpVerifyAndCreateUser = async ({
  otp,
  token,
}: OTPVerifyAndCreateUserProps) => {
  if (!token) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Token not found');
  }

  const decodeData = verifyToken({
    token,
    access_secret: config.jwt_access_secret as string,
  });

  if (!decodeData) {
    throw new AppError(httpStatus.BAD_REQUEST, 'You are not authorised');
  }

  const { fullName, email, phone, gender, password } = decodeData;

  console.log({ otp });

  const isOtpMatch = await otpServices.otpMatch(email, otp);

  if (!isOtpMatch) {
    throw new AppError(httpStatus.BAD_REQUEST, 'OTP did not match');
  }

  process.nextTick(async () => {
    await otpServices.updateOtpByEmail(email, {
      status: 'verified',
    });
  });

  const isExist = await User.isUserExist(email as string);

  if (isExist) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'User already exists with this email',
    );
  }

  const userData = {
    fullName,
    email,
    phone,
    gender,
    password,
    role: 'user',
  };

  const user = await User.create(userData);

  console.log({ user });

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User creation failed');
  }


  const adminId = getAdminId()
    const newNotification = new Notification({
    userId: user?._id, // Ensure that userId is of type mongoose.Types.ObjectId
    receiverId: adminId, // Ensure that receiverId is of type mongoose.Types.ObjectId
    message: "New user has joined in your application",
    type: 'Join', // Use the provided type (default to "FollowRequest")
    isRead: false, // Set to false since the notification is unread initially
    timestamp: new Date(), // Timestamp of when the notification is created
  });

  emitNotification( {userId: user?._id, 
    receiverId: adminId, 
    message: "New user has joined in your application",
    type: 'Join',})

  const jwtPayload: {
    userId: string;
    role: string;
    email: string;
  } = {
    email: user.email,
    userId: user?._id?.toString() as string,
    role: user?.role,
  };

  // console.log({ jwtPayload });

  const accessToken = createToken({
    payload: jwtPayload,
    access_secret: config.jwt_access_secret as string,
    expity_time: '5m',
  });

  return accessToken;
};

const completedUser = async (id: string, payload: Partial<TUser>) => {
  const { role, email, isBlocked, isDeleted, password, ...rest } = payload;

  console.log('rest data', rest);

  const user = await User.findByIdAndUpdate(id, rest, { new: true });

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User completing failed');
  }

  const newNotification = new Notification({
    userId: user?._id, // Ensure that userId is of type mongoose.Types.ObjectId
    receiverId: '67f4c294dca4296adb805029', // Ensure that receiverId is of type mongoose.Types.ObjectId
    message: {
      fullName: user.fullName || '',
      image: user.profileImage || '', // Placeholder image URL (adjust this)
      text: 'New user added in your app',
    },
    type: 'added', // Use the provided type (default to "FollowRequest")
    isRead: false, // Set to false since the notification is unread initially
    timestamp: new Date(), // Timestamp of when the notification is created
  });

  console.log({ newNotification });

  const result = await newNotification.save();

  console.log('===new notifications --->>> ', result);

  return user;
};

const updateUser = async (id: string, payload: Partial<TUser>) => {

  const { role, email, isBlocked, isDeleted, password, ...rest } = payload;

  console.log('rest data', rest);

  const user = await User.findByIdAndUpdate(id, rest, { new: true });

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User updating failed');
  }

  return user;
};


const addUniqueCardToUser = async (userId: string, newCard: TCard) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User not found');
  }

  // Ensure `cards` is always an array (even if it's undefined or null)
  const cards = user.cards ?? [];

  // Check if the card number already exists
  const isCardExist = cards.some(
    card => card.cardNumber === newCard.cardNumber
  );

  if (isCardExist) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Card number already exists');
  }


  console.log({newCard})
  // If not exist, add the card
  cards.push(newCard);
  user.cards = cards;
  await user.save();

  return user;
};

const getMyCards = async (id: string) => {
 

  const userData = await User.findById(id)

  if (!userData) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }



  return userData.cards;
};
// ............................rest

const getAllUserQuery = async (
  userId: string,
  query: Record<string, unknown>,
) => {
  const userQuery = new QueryBuilder(User.find({ _id: { $ne: userId } }), query)
    .search(['fullName'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await userQuery.modelQuery;
  const meta = await userQuery.countTotal();
  return { meta, result };
};

const getAllUserCount = async () => {
  const allUserCount = await User.countDocuments();
  return allUserCount;
};

const getUsersOverview = async (userId: string, year: number) => {
  try {
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year + 1}-01-01`);

    const monthNames = [
      '', 'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];

    const [
      totalUsers,
      totalEarningsResult,
      userOverviewRaw,
      earningOverviewRaw,
      recentUsers,
    ] = await Promise.all([
      User.countDocuments(),

      Payment.aggregate([
        { $group: { _id: null, totalAmount: { $sum: '$amount' } } },
      ]),

      User.aggregate([
        { $match: { createdAt: { $gte: startDate, $lt: endDate } } },
        { $group: { _id: { $month: '$createdAt' }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),

      Payment.aggregate([
        { $match: { createdAt: { $gte: startDate, $lt: endDate } } },
        { $group: { _id: { $month: '$createdAt' }, totalAmount: { $sum: '$amount' } } },
        { $sort: { _id: 1 } },
      ]),

      User.find({ _id: { $ne: userId } })
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
    ]);

    const totalEarnings = totalEarningsResult.length > 0 ? totalEarningsResult[0].totalAmount : 0;

    // Build unified overview
    const monthlyOverview = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const userData = userOverviewRaw.find(item => item._id === month);
      const earningData = earningOverviewRaw.find(item => item._id === month);

      return {
        month,
        monthName: monthNames[month],
        userCount: userData ? userData.count : 0,
        totalEarnings: earningData ? earningData.totalAmount : 0,
      };
    });

    return {
      totalUsers,
      totalEarnings,
      monthlyOverview, // one array for both user and earning stats
      recentUsers,
    };
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    throw new Error('Error fetching dashboard data.');
  }
};



// const getUsersOverview = async (userId: string, year: any) => {
//   try {
//     // Fetch total user count
//     const totalUsers = await User.countDocuments();

//         const totalEarningsResult = await Payment.aggregate([
//       {
//         $group: {
//           _id: null,
//           totalAmount: { $sum: '$amount' },
//         },
//       },
//     ]);

//     const totalEarnings = totalEarningsResult.length > 0 ? totalEarningsResult[0].totalAmount : 0;


//     // Fetch user growth over time for the specified year (monthly count with month name)
//     const userOverview = await User.aggregate([
//       {
//         $match: {
//           createdAt: {
//             $gte: new Date(`${year}-01-01`),
//             $lt: new Date(`${year + 1}-01-01`),
//           }, // Filter by year
//         },
//       },
//       {
//         $group: {
//           _id: { $month: '$createdAt' }, // Group by month of the 'createdAt' date
//           count: { $sum: 1 },
//         },
//       },
//       {
//         $project: {
//           _id: 1,
//           count: 1,
//           monthName: {
//             $switch: {
//               branches: [
//                 { case: { $eq: ['$_id', 1] }, then: 'January' },
//                 { case: { $eq: ['$_id', 2] }, then: 'February' },
//                 { case: { $eq: ['$_id', 3] }, then: 'March' },
//                 { case: { $eq: ['$_id', 4] }, then: 'April' },
//                 { case: { $eq: ['$_id', 5] }, then: 'May' },
//                 { case: { $eq: ['$_id', 6] }, then: 'June' },
//                 { case: { $eq: ['$_id', 7] }, then: 'July' },
//                 { case: { $eq: ['$_id', 8] }, then: 'August' },
//                 { case: { $eq: ['$_id', 9] }, then: 'September' },
//                 { case: { $eq: ['$_id', 10] }, then: 'October' },
//                 { case: { $eq: ['$_id', 11] }, then: 'November' },
//                 { case: { $eq: ['$_id', 12] }, then: 'December' },
//               ],
//               default: 'Unknown', // Default value in case month is not valid
//             },
//           },
//         },
//       },
//       { $sort: { _id: 1 } }, // Sort by month (ascending)
//     ]);

//     const earningOverview = await Payment.aggregate([
//   {
//     $match: {
//       createdAt: {
//         $gte: new Date(`${year}-01-01`),
//         $lt: new Date(`${year + 1}-01-01`),
//       },
//     },
//   },
//   {
//     $group: {
//       _id: { $month: '$createdAt' },
//       totalAmount: { $sum: '$amount' },  // sum amount here
//     },
//   },
//   {
//     $project: {
//       _id: 1,
//       totalAmount: 1,
//       monthName: {
//         $switch: {
//           branches: [
//             { case: { $eq: ['$_id', 1] }, then: 'January' },
//             { case: { $eq: ['$_id', 2] }, then: 'February' },
//             { case: { $eq: ['$_id', 3] }, then: 'March' },
//             { case: { $eq: ['$_id', 4] }, then: 'April' },
//             { case: { $eq: ['$_id', 5] }, then: 'May' },
//             { case: { $eq: ['$_id', 6] }, then: 'June' },
//             { case: { $eq: ['$_id', 7] }, then: 'July' },
//             { case: { $eq: ['$_id', 8] }, then: 'August' },
//             { case: { $eq: ['$_id', 9] }, then: 'September' },
//             { case: { $eq: ['$_id', 10] }, then: 'October' },
//             { case: { $eq: ['$_id', 11] }, then: 'November' },
//             { case: { $eq: ['$_id', 12] }, then: 'December' },
//           ],
//           default: 'Unknown',
//         },
//       },
//     },
//   },
//   { $sort: { _id: 1 } },
// ]);

//     // Fetch recent users
//     const recentUsers = await User.find({ _id: { $ne: userId } })
//       .sort({ createdAt: -1 })
//       .limit(6);

//     return {
//       totalUsers,
//       totalEarnings,
//       earningOverview,
//       userOverview, // Includes month names with user counts
//       recentUsers,
//     };
//   } catch (error) {
//     console.error('Error fetching dashboard overview:', error);
//     throw new Error('Error fetching dashboard data.');
//   }
// };



// const getUsersOverview = async (userId: string, year: number) => {
//   try {
//     const startDate = new Date(`${year}-01-01`);
//     const endDate = new Date(`${year + 1}-01-01`);

//     // Run independent queries in parallel for better performance
//     const [
//       totalUsers,
//       totalEarningsResult,
//       userOverview,
//       earningOverview,
//       recentUsers,
//     ] = await Promise.all([
//       User.countDocuments(),

//       Payment.aggregate([
//         { $group: { _id: null, totalAmount: { $sum: '$amount' } } },
//       ]),

//       User.aggregate([
//         { $match: { createdAt: { $gte: startDate, $lt: endDate } } },
//         { $group: { _id: { $month: '$createdAt' }, count: { $sum: 1 } } },
//         { $project: { _id: 1, count: 1, monthName: monthNameSwitch } },
//         { $sort: { _id: 1 } },
//       ]),

//       Payment.aggregate([
//         { $match: { createdAt: { $gte: startDate, $lt: endDate } } },
//         { $group: { _id: { $month: '$createdAt' }, totalAmount: { $sum: '$amount' } } },
//         { $project: { _id: 1, totalAmount: 1, monthName: monthNameSwitch } },
//         { $sort: { _id: 1 } },
//       ]),

//       User.find({ _id: { $ne: userId } })
//         .sort({ createdAt: -1 })
//         .limit(6)
//         .lean(),
//     ]);

//     const totalEarnings = totalEarningsResult.length > 0 ? totalEarningsResult[0].totalAmount : 0;

//     return {
//       totalUsers,
//       totalEarnings,
//       userOverview,
//       earningOverview,
//       recentUsers,
//     };
//   } catch (error) {
//     console.error('Error fetching dashboard overview:', error);
//     throw new Error('Error fetching dashboard data.');
//   }
// };

const getUserById = async (id: string) => {
  const result = await User.findById(id);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  return result;
};

// Optimized the function to improve performance, reducing the processing time to 235 milliseconds.
const getMyProfile = async (id: string) => {
 

  const userData = await User.findById(id)

  if (!userData) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }



  return userData;
};

const getAdminProfile = async (id: string) => {
  const result = await User.findById(id).lean();

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  return result;
};

const getUserByEmail = async (email: string) => {
  const result = await User.findOne({ email });

  return result;
};

const deleteMyAccount = async (id: string, payload: DeleteAccountPayload) => {
  const user: TUser | null = await User.IsUserExistById(id);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (user?.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted');
  }

  if (!(await User.isPasswordMatched(payload.password, user.password))) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Password does not match');
  }

  const userDeleted = await User.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );

  if (!userDeleted) {
    throw new AppError(httpStatus.BAD_REQUEST, 'user deleting failed');
  }

  return userDeleted;
};

const blockUser = async (id: string) => {
  const singleUser = await User.IsUserExistById(id);

  if (!singleUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (singleUser.isBlocked) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User is already blocked');
  }

  const user = await User.findByIdAndUpdate(
    id,
    { isBlocked: true }, // Assuming you want to block the user here
    { new: true },
  );

  if (!user) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to block the user');
  }

  return user;
};

const unblockUser = async (id: string) => {
  const singleUser = await User.IsUserExistById(id);

  if (!singleUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (!singleUser.isBlocked) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User is already unblocked');
  }

  const user = await User.findByIdAndUpdate(
    id,
    { isBlocked: false }, // Assuming you want to block the user here
    { new: true },
  );

  if (!user) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to block the user');
  }

  return;
};

export const userService = {
  createUserToken,
  otpVerifyAndCreateUser,
  completedUser,
  addUniqueCardToUser,
  getMyCards,
  getMyProfile,
  getAdminProfile,
  getUserById,
  getUserByEmail,
  updateUser,
  deleteMyAccount,
  blockUser,
  unblockUser,
  getAllUserQuery,
  getAllUserCount,
  getUsersOverview,
};
