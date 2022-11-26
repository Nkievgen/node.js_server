const path = require('path');

const express = require('express');
const router = express.Router();

const shopController = require('../controllers/shop');
const isAuth = require('../middleware/is-auth');

router.get('/',
    shopController.getIndex
);

router.get('/product-list',
    shopController.getProductList
);

router.get('/product-list/:productId',
    shopController.getProductDetails
);

router.get('/cart',
    isAuth,
    shopController.getCart
);

router.post('/cart',
    isAuth,
    shopController.postCart
);

router.post('/remove-from-cart',
    isAuth,
    shopController.removeFromCart
);

// router.get('/cart/checkout', shopController.getCheckout);

router.get('/orders',
    isAuth,
    shopController.getOrders
);

router.post('/create-order',
    isAuth,
    shopController.postOrder
);



module.exports = router;