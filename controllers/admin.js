//auth flow is not yet implemented so admin controllers do not check if user is an admin

const mongodb = require('mongodb');
const Product = require('../models/product');

//controller fetches all products in db and then renders product page
exports.getProductList = (req, res, next) => {
    console.log('handling get admin product list request');
    Product
        .find()
        .then(products => {
            console.log('sending admin productlist page', '\n');
            res.render('./admin/product-list',{
                prods: products,
                pageTitle: "Admin Product List",
                path: "/admin/product-list"
            });
        })
        .catch(
            err => console.log(err)
        );
}

//controller reads a post request and adds a new product to db, redirects to add product controller
exports.postAddProduct = (req, res, next) => {
    console.log('handling post add product request');
    const title = req.body.title;
    const price = req.body.price;
    const imageUrl = req.body.imageUrl;
    const description = req.body.description;
    const product = new Product({
        title: title,
        price: price,
        description: description,
        imageUrl: imageUrl,
        userId: req.user
    });
    product
        .save()
        .then(() => {
            console.log('product created');
            res.redirect('/admin/add-product');
        })
        .catch(err => {
            console.log(err);
        });
}

//controllers renders add product page
exports.getAddProduct = (req, res, next) => {
    console.log('handling get add product request');
    console.log('sending add product page', '\n');
    res.render('./admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false
    })
}

//controller fetches product data and then passes it to edit page to pre-populate input fields in edit product page
exports.getEditProduct = (req, res, next) => {
    console.log('handling get edit product request');
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
        .catch(err => 
            console.log(err)
        );
}

//controller reads a request and  updates a product in db, redirects to product list controller
exports.postEditProduct = (req, res, next) => {
    console.log('handling post edit product request');
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
        .catch(err =>
            console.log(err)
        );
}

//controlelr deletes a product from a db and redirects to product list controller
exports.postDeleteProduct = (req, res, next) => {
    console.log('handling post delete product request');
    const productId = req.body.productId;
    Product
        .findByIdAndRemove(productId)
        .then(() => {
            console.log('product deleted');
            console.log('redirecting to admin product list');
            res.redirect('/admin/product-list');
        })
        .catch(err =>
            console.log(err)
        );
}
