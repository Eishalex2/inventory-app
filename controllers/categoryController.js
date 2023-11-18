const Category = require('../models/category');
const Item = require('../models/item');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');

exports.category_list = asyncHandler(async (req, res, next) => {
  // Get list of all categories, sort, pass to template
  const allCategories = await Category.find({}, "name")
    .sort({ name: 1 })
    .exec();

  res.render("category_list", { title: "List of Categories", category_list: allCategories });
});

exports.category_detail = asyncHandler(async (req, res, next) => {
  // Get details of category and all its items
  const [category, allItemsInCategory] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({ category: req.params.id }, "name description").exec(),
  ]);

  if (category === null) {
    // No results
    const err = new Error("Category not found");
    err.status = 404;
    return next(err);
  }

  res.render("category_detail", {
    title: "Category Detail",
    category: category,
    category_items: allItemsInCategory,
  });
});

exports.category_create_get = (req, res, next) => {
  res.render('category_form', { title: "Create Category", category: false, errors: false });
};

exports.category_create_post = [
  // Validate and sanitize name field
  body("name", "Category name must contain at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  
  // Process request
  asyncHandler(async (req, res, next) => {
    // extract any errors
    const errors = validationResult(req);

    // Create a category object with the cleaned data
    const category = new Category({ name: req.body.name });

    if (!errors.isEmpty()) {
      res.render("category_form", {
        title: "Create Category",
        category: category,
        errors: errors.array(),
      });
      return;
    } else {
      // Data is valid
      // Check if category with same name already exists
      const categoryExists = await Category.findOne({ name: req.body.name }).exec();
      if (categoryExists) {
        res.redirect(categoryExists.url);
      } else {
        await category.save();
        res.redirect(category.url);
      }
    }
  }),
]

exports.category_delete_get = asyncHandler(async (req, res, next) => {
  // Get details of category and all its items
  const [category, allItemsInCategory] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({ category: req.params.id }, "name").exec(),
  ]);

  if (category === null) {
    res.redirect('/categories');
  }

  res.render("category_delete", {
    title: "Delete Category",
    category: category,
    category_items: allItemsInCategory,
  });
});

exports.category_delete_post = asyncHandler(async (req, res, next) => {
  // Only allow deletection if it's not referenced by any items
  const [category, allItemsInCategory] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({ category: req.params.id }, "name").exec(),
  ]);

  // Check to see if the category has associated items
  if (allItemsInCategory.length > 0) {
    res.render("category_delete", {
      title: "Delete Category",
      category: category,
      category_items: allItemsInCategory,
    });
    return;
  } else {
    // Okay to delete
    await Category.findByIdAndDelete(req.body.categoryid);
    res.redirect('/categories');
  }
});

exports.category_update_get = asyncHandler(async (req, res, next) => {
  // get category
  const category = await Category.findById(req.params.id);

  if (category === null) {
    const err = new Error("Category not found");
    err.status = 404;
    return next(err);
  }

  res.render("category_form", {
    title: "Update Category",
    category: category,
    errors: false,
  });
});

exports.category_update_post = [
  // validate and sanitize
  body("name", "Category name must contain at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const category = new Category({ name: req.body.name, _id: req.params.id });

    if (!errors.isEmpty()) {
      res.render("category_form", {
        title: "Update Category",
        category: category,
        errors: errors.array(),
      });
      return;
    } else {
      const updatedCategory = await Category.findByIdAndUpdate(req.params.id, category, {});
      res.redirect(updatedCategory.url);
    }
  }),
]