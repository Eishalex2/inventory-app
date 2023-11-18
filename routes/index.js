const express = require('express');
const router = express.Router();

const category_controller = require('../controllers/categoryController');
const item_controller = require('../controllers/itemController');

/// Category Routes ///

router.get('/category/create', category_controller.category_create_get);

router.post('/category/create', category_controller.category_create_post);

router.get('/category/:id/delete', category_controller.category_delete_get);

router.post('/category/:id/delete', category_controller.category_delete_post);

router.get('/category/:id/update', category_controller.category_update_get);

router.post('/category/:id/update', category_controller.category_update_post);

// Get particular category detail page
router.get('/category/:id', category_controller.category_detail);

// Get list of all categories
router.get('/categories', category_controller.category_list);

/// ITEM ROUTES ///

router.get('/', item_controller.index);

router.get('/item/create', item_controller.item_create_get);

router.post('/item/create', item_controller.item_create_post);

router.get('/item/:id/delete', item_controller.item_delete_get);

router.post('/item/:id/delete', item_controller.item_delete_post);

router.get('/item/:id/update', item_controller.item_update_get);

router.post('/item/:id/update', item_controller.item_update_post);

// Get particular book detail page
router.get('/item/:id', item_controller.item_detail);

// Get list of all items
router.get('/items', item_controller.item_list);



module.exports = router;