const mongodb = require('mongodb');
const Product = require('../models/product');
const user = require('../models/user');

//fetching all products from the db and rendering product list page
exports.getProductList = (req, res, next) => {
    Product
        .find()
        .then(products => {
            res.render('./admin/product-list',{
                prods: products,
                pageTitle: "Admin Product List",
                path: "/admin/product-list"
            });
        })
        .catch(err => {
            console.log(err);
            req.flash('error', 'Unexpected error');
            res.redirect('/');
        });
}

//adding a new product to the db, redirecting to add product
exports.postAddProduct = (req, res, next) => {
    const userId = req.session.user._id;
    const title = req.body.title;
    const price = req.body.price;
    const imageUrl = req.body.imageUrl;
    const description = req.body.description;
    const product = new Product({
        title: title,
        price: price,
        description: description,
        imageUrl: imageUrl,
        userId: userId
    });
    product
        .save()
        .then(() => {
            res.redirect('/admin/add-product');
        })
        .catch(err => {
            console.log(err);
            req.flash('error', 'Unexpected error');
            res.redirect('/');
        });
}

//rendering add product page
exports.getAddProduct = (req, res, next) => {
    res.render('./admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false
    })
}

//fetching product data and then rendering edit page with pre-populated input fields
exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect('/');
    }
    const prodId = req.params.productId;
    Product
        .findById(prodId)
        .then((product) => {
            if (!product){
                return res.redirect('/admin/product-list');
            }
            res.render('./admin/edit-product', {
                pageTitle: 'Edit Product',
                path: '/admin/edit-product',
                editing: editMode,
                product: product
            })
        })
        .catch(err => {
            console.log(err);
            req.flash('error', 'Unexpected error');
            res.redirect('/');
        });
}

//updating a product in the db, redirecting to product list
exports.postEditProduct = (req, res, next) => {
    const productId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const updatedImageUrl = req.body.imageUrl;
    const updatedDescription = req.body.description;
    Product
        .findById(productId)
        .then(product => {
            product.title = updatedTitle;
            product.price = updatedPrice;
            product.description = updatedDescription;
            product.imageUrl = updatedImageUrl;
            return product.save();
        })
        .then(() => {
            console.log('product updated');
            res.redirect('/admin/product-list');
        })
        .catch(err => {
            console.log(err);
            req.flash('error', 'Unexpected error');
            res.redirect('/');
        });
}

//deleting a product from the db and redirecting to product list
exports.postDeleteProduct = (req, res, next) => {
    const productId = req.body.productId;
    Product
        .findByIdAndRemove(productId)
        .then(() => {
            res.redirect('/admin/product-list');
        })
        .catch(err => {
            console.log(err);
            req.flash('error', 'Unexpected error');
            res.redirect('/');
        });
}
