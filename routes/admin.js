const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');
const productValidation = require('../validation/product');

router.get('/add-product',
    isAuth,
    adminController.getAddProduct
);

router.post('/add-product',
    isAuth,
    productValidation,
    adminController.postAddProduct
);

router.get('/product-list',
    isAuth,
    adminController.getProductList
);

router.get('/edit-product/:productId',
    isAuth,
    adminController.getEditProduct
);

router.post('/edit-product',
    isAuth,
    productValidation,
    adminController.postEditProduct
);

router.post('/delete-product',
    isAuth,
    adminController.postDeleteProduct
);

module.exports = router;
