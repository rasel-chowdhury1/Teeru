import Category from './category.model';
import AppError from '../../error/AppError';
import httpStatus from 'http-status';
import { ICategory } from './category.interface';
import QueryBuilder from '../../builder/QueryBuilder';

const createCategory = async (data: ICategory) => {
  // Check if the category already exists
  const existingCategory = await Category.findOne({ name: data.name });
  if (existingCategory) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Category with this name already exists');
  }

  // Create a new category
  const newCategory = new Category(data);
  await newCategory.save();
  return newCategory;
};

// const getAllCategories = async () => {
//   // Fetch all categories
//   return await Category.find({isDeleted: false});
// };

const getAllCategories = async (
  query: Record<string, unknown>,
) => {
  const userQuery = new QueryBuilder(Category.find({isDeleted: false}), query)
    .search([])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await userQuery.modelQuery;
  const meta = await userQuery.countTotal();
  return { meta, result };
};

const getAllDeltedCategories = async () => {
  // Fetch all categories
  return await Category.find({isDeleted: true});
};

const getCategoryById = async (id: string) => {
  // Find category by ID
  const category = await Category.findById(id);
  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
  }
  return category;
};

const updateCategory = async (id: string, data: Partial<ICategory>) => {
  // Find and update category by ID
  const updatedCategory = await Category.findByIdAndUpdate(id, data, { new: true });
  if (!updatedCategory) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
  }
  return updatedCategory;
};

const deleteCategory = async (id: string) => {
  // Find and delete category by ID
  const category = await Category.findByIdAndUpdate(id, {isDeleted: true}, {new: true});
  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
  }
  return null;
};

export const categoryService = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getAllDeltedCategories
};
