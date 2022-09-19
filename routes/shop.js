const path = require('path');

const express = require('express');
const router = express.Router();

const shopController = require('../controllers/shop');

router.get('/', shopController.getIndex);

router.get('/product-list', shopController.getProductList);

router.get('/product-list/:productId', shopController.getProductDetails);

router.get('/cart', shopController.getCart);

router.post('/cart', shopController.postCart);

router.post('/remove-from-cart', shopController.removeFromCart);

// router.get('/cart/checkout', shopController.getCheckout);

router.get('/orders', shopController.getOrders);

router.post('/create-order', shopController.postOrder);



module.exports = router;