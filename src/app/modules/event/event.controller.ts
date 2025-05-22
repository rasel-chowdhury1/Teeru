import { Request, Response } from 'express';
import { eventService } from './event.service';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';

const createEvent = catchAsync(async (req: Request, res: Response) => {

    
  req.body.isDeleted = false;

  const newEvent = await eventService.createEvent(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Event created successfully',
    data: newEvent,
  });
});

const getAllEvents = catchAsync(async (req: Request, res: Response) => {
  const events = await eventService.getAllEvents(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Events fetched successfully',
    data: events,
  });
});

const getSpecificCategoryEvents = catchAsync(async (req: Request, res: Response) => {

  const {categoryId} = req.params;

  const events = await eventService.getSpecificCategoryEvents(categoryId, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Specific category events fetched successfully',
    data: events,
  });
});

const getSpecificEvent = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const event = await eventService.getSpecificEvent(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Event fetched successfully',
    data: event,
  });
});

const getUpcomingEventOfSpecificUser = catchAsync( async (req: Request, res: Response) => {
   

    const upcomingEvents = await eventService.getUpcomingEventOfSpecificUser(req.user.userId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Upcoming events fetched successfully',
      data: upcomingEvents,
    });
  }
);

const updateEvent = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;


  const updatedEvent = await eventService.updateEvent(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Event updated successfully',
    data: updatedEvent,
  });
});

const softDeleteEvent = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = await eventService.softDeleteEvent(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Event deleted successfully',
    data: deleted,
  });
});

export const eventController = {
  createEvent,
  getAllEvents,
  getSpecificCategoryEvents,
  getSpecificEvent,
  getUpcomingEventOfSpecificUser,
  updateEvent,
  softDeleteEvent,
};
