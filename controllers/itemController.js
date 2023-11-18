const Item = require('../models/item');
const Category = require('../models/category');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');

exports.index = asyncHandler(async (req, res, next) => {
  // Display counts of all categories and items
  const [numCategories, numItems] = await Promise.all([
    Category.countDocuments({}).exec(),
    Item.countDocuments({}).exec(),
  ]);

  res.render("index", {
    title: "Inventory Home",
    category_count: numCategories,
    item_count: numItems,
  });
})

exports.item_list = asyncHandler(async (req, res, next) => {
  const allItems = await Item.find({}, "name price")
    .sort({ name: 1 })
    .populate("category")
    .exec();

  res.render("item_list", {title: "List of Items", item_list: allItems });
});

exports.item_detail = asyncHandler(async (req, res, next) => {
  const item = await Item.findById(req.params.id)
    .populate("category")
    .exec();

  if (item === null) {
    // No results
    const err = new Error("Item not found");
    err.status = 404;
    return next(err);
  }

  res.render("item_detail", {
    title: "Item Detail",
    item: item,
  });
});

exports.item_create_get = asyncHandler(async (req, res, next) => {
  // Get all categories, which we will use for adding to our item
  const allCategories = await Category.find().exec();

  res.render("item_form", {
    title: "Create Item",
    categories: allCategories,
    item: false,
    errors: false
  });
});

exports.item_create_post = [
  // Validate and sanitize
  body("name", "Name must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("description", "Description must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("category", "Category must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("price", "Price must not be empty and needs to be greater than 0")
    .trim()
    .notEmpty()
    .isInt({ min: 1 })
    .escape(),
  body("number_in_stock", "In stock must not be empty and needs to be at least 0")
    .trim()
    .notEmpty()
    .isInt({ min: 0 })
    .escape(),

  // Process after cleaning
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const item = new Item({
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      price: req.body.price,
      number_in_stock: req.body.number_in_stock,
    });

    if (!errors.isEmpty()) {
      // Get all categories for form
      const [allCategories] = await Category.find().exec()

      res.render("item_form", {
        title: "Create Item",
        categories: allCategories,
        item: item,
        errors: errors.array(),
      });
      return;
    } else {
      await item.save();
      res.redirect(item.url);
    }
  }),
]

exports.item_delete_get = asyncHandler(async (req, res, next) => {
  // get details of item
  const item = await Item.findById(req.params.id);

  if (item === null) {
    res.redirect('/items');
  }

  res.render('item_delete', {
    title: "Delete Item",
    item: item,
  });
});

exports.item_delete_post = asyncHandler(async (req, res, next) => {
  await Item.findByIdAndDelete(req.body.itemid);
  res.redirect('/items');
});

exports.item_update_get = asyncHandler(async (req, res, next) => {
  // get item and all categories
  const [item, allCategories] = await Promise.all([
    Item.findById(req.params.id).populate("category").exec(),
    Category.find().exec(),
  ]);

  if (item === null) {
    const err = new Error("Item not found");
    err.status = 404;
    return next(err);
  }

  res.render("item_form", {
    title: "Update Item",
    item: item,
    categories: allCategories,
    errors: false,
  });
});

exports.item_update_post = [
  // Validate and sanitize
  body("name", "Name must not be empty")
  .trim()
  .isLength({ min: 1 })
  .escape(),
  body("description", "Description must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("category", "Category must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("price", "Price must not be empty and needs to be greater than 0")
    .trim()
    .notEmpty()
    .isInt({ min: 1 })
    .escape(),
  body("number_in_stock", "In stock must not be empty and needs to be at least 0")
    .trim()
    .notEmpty()
    .isInt({ min: 0 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    // extract errors
    const errors = validationResult(req);

    const item = new Item({
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      price: req.body.price,
      number_in_stock: req.body.number_in_stock,
      _id: req.params.id
    });

    if (!errors.isEmpty()) {
      // Get all categories for form
      const allCategories = await Category.find().exec();

      res.render("item_form", {
        title: "Update Item",
        categories: allCategories,
        item: item,
        errors: errors.array(),
      });
      return;
    } else {
      const updatedItem = await Item.findByIdAndUpdate(req.params.id, item, {});
      res.redirect(updatedItem.url);
    }
  }),
]