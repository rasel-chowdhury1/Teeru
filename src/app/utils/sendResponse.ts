import { Response } from 'express';

type TMeta = {
  limit: number;
  page: number;
  total: number;
  totalPage?: number;
};

export type TResponse<T> = {
  statusCode: number;
  success: boolean;
  message?: string;
  data: T;
  meta?: TMeta;
};

const sendResponse = <T>(res: Response, data: TResponse<T>) => {
  res.status(data?.statusCode).json({
    success: data.success,
    statusCode: data?.statusCode,
    message: data.message,
    meta: data.meta,
    data: data.data ,
  });
};

export default sendResponse;
