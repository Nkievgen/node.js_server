const mongoose = require('mongoose');
const Product = require('../models/product');
const { validationResult } = require('express-validator');
const messagesToLocals = require('../util/messages-to-locals');
const deleteFile = require('../util/delete-file');

const emptyProduct = {
    savedTitle: '',
    savedPrice: '',
    savedDescription: ''
}

const renderEditProduct = function(req, res, next, prodId, savedInput = emptyProduct, validationErrors = []) {
    if (validationErrors.length > 0) {
        res.status(422);
    }
    Product
        .findById(prodId)
        .then((product) => {
            if (!product){
                throw new Error('PRODUCT_NOT_FOUND');
            }
            if (product.userId.toString() !== res.locals.userId) {
                throw new Error('AUTH_CHECK_FAIL');
            }
            if (savedInput === emptyProduct) {
                savedInput = {
                    title: product.title,
                    price: product.price,
                    description: product.description
                }
            }
            res.render('./admin/edit-product', {
                pageTitle: 'Edit Product',
                path: '/admin/edit-product',
                editing: true,
                productId: product._id,
                savedInput: savedInput,
                validationErrors: validationErrors
            })
        })
        .catch(err => {
            let viewErrMessage;
            switch(err.message){
                case 'AUTH_CHECK_FAIL':
                    viewErrMessage = 'Authorization check failed';
                    break;
                default:
                    next(err);
                    break;
            }
            req.flash('error', viewErrMessage);
            res.redirect('/admin/product-list');
        });
}

const renderAddProduct = function(req, res, next, savedInput = emptyProduct, validationErrors = []) {
    if (validationErrors.length > 0) {
        res.status(422);
    }
    res.render('./admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
        savedInput: savedInput,
        validationErrors: validationErrors
    })
}

//fetching current user's products from the db and rendering product list page
exports.getProductList = (req, res, next) => {
    sessionUserId = res.locals.userId;
    Product
        .find({
            userId: sessionUserId
        })
        .then(products => {
            res.render('./admin/product-list',{
                prods: products,
                pageTitle: "Admin Product List",
                path: "/admin/product-list"
            });
        })
        .catch(err => {
            next(err);
        });
}

//rendering add product page
exports.getAddProduct = (req, res, next) => {
    renderAddProduct(req, res, next);
}

//adding a new product to the db, redirecting to add product
exports.postAddProduct = (req, res, next) => {
    const userId = res.locals.userId;
    const title = req.body.title;
    const price = req.body.price;
    const image = req.file;
    const description = req.body.description;
    const errors = validationResult(req);
    errArray = errors.array();
    if (!image) {
        errArray.push({msg: 'File should be a *.png or a *.jpeg image', param: 'image'});
    }
    if (errArray.length > 0) {
        messagesToLocals(errArray, res);
        const savedInput = {
            title: title,
            price: price,
            description: description
        };
        return renderAddProduct(req, res, next, savedInput, errArray);
    }
    const imageUrl = image.path;
    const product = new Product({
        title: title,
        price: price,
        description: description,
        imageUrl: imageUrl,
        userId: mongoose.Types.ObjectId(userId)
    });
    product
        .save()
        .then(() => {
            res.redirect('/admin/add-product');
        })
        .catch(err => {
            next(err);
        });
}

//fetching product data and then rendering edit page with pre-populated input fields
exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect('/admin/product-list');
    }
    const prodId = req.params.productId;
    renderEditProduct(req, res, next, prodId);
}

//updating a product in the db, redirecting to product list
exports.postEditProduct = (req, res, next) => {
    const productId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const image = req.file;
    const updatedDescription = req.body.description;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        messagesToLocals(errors.array(), res);
        const savedInput = {
            title: updatedTitle,
            price: updatedPrice,
            description: updatedDescription
        }
        return renderEditProduct(req, res, next, productId, savedInput, errors.array());
    }
    Product
        .findById(productId)
        .then(product => {
            if (product.userId.toString() !== res.locals.userId) {
                throw new Error('AUTH_CHECK_FAIL');
            }
            product.title = updatedTitle;
            product.price = updatedPrice;
            if (image) {
                deleteFile(product.imageUrl);
                product.imageUrl = image.path;
            }
            product.description = updatedDescription;
            return product.save();
        })
        .then(() => {
            res.redirect('/admin/product-list');
        })
        .catch(err => {
            let viewErrMessage;
            switch(err.message){
                case 'AUTH_CHECK_FAIL':
                    viewErrMessage = 'Authorization check failed';
                    break;
                default:
                    next(err);
                    break;
            }
            req.flash('error', viewErrMessage);
            res.redirect('/');
        });
}

//deleting a product from the db and redirecting to product list
exports.postDeleteProduct = (req, res, next) => {
    const productId = req.body.productId;
    let imagePath;
    Product
        .findById(productId)
        .then(product => {
            imagePath = product.imageUrl;
            return Product.deleteOne({
                _id: productId,
                userId: res.locals.userId
            })
        })
        .then(result => {
            if (result.deletedCount == 0) {
                throw new Error('WRONG_AUTH_OR_ID');
            }
            deleteFile(imagePath);
            res.redirect('/admin/product-list');
        })
        .catch(err => {
            console.log(err);
            let viewErrMessage;
            switch(err.message){
                case 'WRONG_AUTH_OR_ID':
                    viewErrMessage = 'Authorization check failed';
                    break;
                default:
                    next(err);
                    break;
            }
            req.flash('error', viewErrMessage);
            res.redirect('/admin/product-list');
        });
}
