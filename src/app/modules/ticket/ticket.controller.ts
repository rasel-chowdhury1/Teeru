import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ticketServices } from "./ticket.service";
import httpStatus from 'http-status';

const buyTicket = catchAsync(async (req: Request, res: Response) => {
      req.body.fullName = req.user.fullName;
      req.body.userId = req.user.userId;
  
      console.log(req.body)
    const newTicket = await ticketServices.buyTicket(req.body);
  
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: 'TIcket buy successfully',
      data: newTicket,
    });
  });

const getUserTickets = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;

  const tickets = await ticketServices.getUserTickets(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User tickets retrieved successfully',
    data: tickets,
  });
});

export const ticketController = {
    buyTicket,
    getUserTickets
}