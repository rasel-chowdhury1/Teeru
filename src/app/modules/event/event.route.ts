import { Router } from 'express';
import { eventController } from './event.controller';
import auth from '../../middleware/auth';

export const eventRoutes = Router();

// Routes for event CRUD operations
eventRoutes
  .post(
    '/create',
    auth('admin'),
    eventController.createEvent
  ) // Create event

  .get(
    '/',
    eventController.getAllEvents
  ) // Get all events

  .get(
    "/upcoming",
    auth("user"),
    eventController.getUpcomingEventOfSpecificUser
  )

  .get(
    "/speceficCategoryEvent/:categoryId",
    eventController.getSpecificCategoryEvents
  )

  .get(
    '/:id',
    eventController.getSpecificEvent
  ) // Get event by id

  .patch(
    '/:id',
    auth('admin'),
    eventController.updateEvent
  ) // Update event

  .delete(
    '/:id',
    auth('admin'),
    eventController.softDeleteEvent
  ); // Soft delete event
