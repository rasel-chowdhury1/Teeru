import { Request, Response } from 'express';
import { categoryService } from './category.service';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import { storeFile } from '../../utils/fileHelper';

const createCategory = catchAsync(async (req: Request, res: Response) => {
  if (req?.file) {
      req.body.image = storeFile('category', req?.file?.filename);
    }
    
    req.body.isDeleted = false;

  const newCategory = await categoryService.createCategory(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Category created successfully',
    data: newCategory,
  });
});

const getAllCategories = catchAsync(async (req: Request, res: Response) => {
  const categories = await categoryService.getAllCategories(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Categories fetched successfully',
    data: categories,
  });
});

const getAllDeltedCategories = catchAsync(async (req: Request, res: Response) => {
  const categories = await categoryService.getAllDeltedCategories();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Categories fetched successfully',
    data: categories,
  });
});

const getCategoryById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const category = await categoryService.getCategoryById(id);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Category fetched successfully',
    data: category,
  });
});

const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  console.log("file data --->>> ", req.file)
  if (req?.file) {
    req.body.image = storeFile('category', req?.file?.filename);
  }

  console.log("update category -->>> ", req.body);
  const updatedCategory = await categoryService.updateCategory(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Category updated successfully',
    data: updatedCategory,
  });
});

const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const deletedCategory = await categoryService.deleteCategory(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Category deleted successfully',
    data: deletedCategory,
  });
});

export const categoryController = {
  createCategory,
  getAllCategories,
  getAllDeltedCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
