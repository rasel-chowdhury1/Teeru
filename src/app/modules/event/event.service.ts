import Event from './event.model';
import AppError from '../../error/AppError';
import httpStatus from 'http-status';
import { IEvent } from './event.interface';
import QueryBuilder from '../../builder/QueryBuilder';

const createEvent = async (data: IEvent) => {
  const newEvent = new Event(data);
  await newEvent.save();
  return newEvent;
};

const updateEvent = async (id: string, data: Partial<IEvent>) => {
  const updatedEvent = await Event.findByIdAndUpdate(id, data, { new: true });
  if (!updatedEvent) {
    throw new AppError(httpStatus.NOT_FOUND, 'Event not found');
  }
  return updatedEvent;
};

const getAllEvents = async (query: Record<string, unknown>) => {
  const eventQuery = new QueryBuilder(Event.find({ isDeleted: false }), query)
    .search([]) // Add searchable fields if needed
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await eventQuery.modelQuery;
  const meta = await eventQuery.countTotal();
  return { meta, result };
};

const getSpecificEvent = async (id: string) => {
  const event = await Event.findById(id);
  if (!event || event.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Event not found');
  }
  return event;
};

const softDeleteEvent = async (id: string) => {
  const event = await Event.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
  if (!event) {
    throw new AppError(httpStatus.NOT_FOUND, 'Event not found');
  }
  return null;
};

export const eventService = {
  createEvent,
  updateEvent,
  getAllEvents,
  getSpecificEvent,
  softDeleteEvent
};
