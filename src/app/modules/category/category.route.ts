import { Router } from 'express';
import { categoryController } from './category.controller';
import auth from '../../middleware/auth';
import fileUpload from '../../middleware/fileUpload';
import parseData from '../../middleware/parseData';
const upload = fileUpload('./public/uploads/category');

export const categoryRoutes = Router();

// Routes for category CRUD operations
categoryRoutes
  .post(
    '/create', 
    auth('admin'), 
    upload.single('image'),
    parseData(),
    categoryController.createCategory
  )  // Create category

  .get(
    '/', 
    categoryController.getAllCategories
  )  // Get all categories

  .get(
    "/deleted",
    auth('admin'),
    categoryController.getAllDeltedCategories
  )

  
  .get(
    '/:id', 
    categoryController.getCategoryById
  )  // Get category by id

  .patch(
    '/:id', 
    auth('admin'), 
    upload.single('image'),
    parseData(),
    categoryController.updateCategory
  )  // Update category

  .delete(
    '/:id', 
    auth('admin'), 
    categoryController.deleteCategory
  );  // Delete category
