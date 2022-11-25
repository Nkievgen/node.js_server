const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');
const productValidation = require('../util/product-validation');

router.get('/add-product',
    isAuth,
    adminController.getAddProduct
);

router.post('/add-product',
    productValidation,
    isAuth,
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
    productValidation,
    isAuth,
    adminController.postEditProduct
);

router.post('/delete-product',
    isAuth,
    adminController.postDeleteProduct
);

module.exports = router;
