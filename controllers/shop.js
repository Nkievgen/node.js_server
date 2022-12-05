const fs = require('fs');
const path = require('path');
const Product = require('../models/product');
const Order = require('../models/order');
const User = require('../models/user');
const PDFDocument = require('pdfkit');
const pgs = require('../util/pagination');

//fetching products from the db and rendering index page
exports.getIndex = (req, res, next) => {
    let totalItems;
    const page = pgs.currentPage(req.query.page);

    Product
        .find()
        .countDocuments()
        .then(numProducts => {
            totalItems = numProducts;
            if ((page > pgs.findLastPage(totalItems))  && (page > 1)) {
                throw new Error('EXCEEDS_LAST_PAGE');
            }
            return Product
                .find()
                .skip(pgs.previousPage(page) * pgs.perPage)
                .limit(pgs.perPage);
        })
        .then(products => {
            res.render('./shop/index', {
                prods: products,
                pageTitle: "Shop",
                path: "/",
                pg: pgs.toView(page, totalItems)
            });
        })
        .catch(err => {
            next(err);
        });
}

//fetching products from the db and rendering index page
exports.getProductList = (req, res, next) => {
    let totalItems;
    const page = pgs.currentPage(req.query.page);

    Product
        .find()
        .countDocuments()
        .then(numProducts => {
            totalItems = numProducts;
            if ((page > pgs.findLastPage(totalItems))  && (page > 1)) {
                throw new Error('EXCEEDS_LAST_PAGE');
            }
            return Product
                .find()
                .skip(pgs.previousPage(page) * pgs.perPage)
                .limit(pgs.perPage);
        })
        .then(products => {
            res.render('./shop/product-list', {
                prods: products,
                pageTitle: "Product List",
                path: "/product-list",
                pg: pgs.toView(page, totalItems)
            });
        })
        .catch(err => {
            next(err);
        });
}

//fetching product data for a specific product and rendering product details page
exports.getProductDetails = (req, res, next) => {
    const searchId = req.params.productId;
    Product
        .findById(searchId)
        .then(product => {
            res.render('./shop/product-details', {
                product: product,
                pageTitle: product.title,
                path: "/product-list"
            });
        })
        .catch(err => {
            next(err);
        });
}

//fetching cart data from the db and rendering cart page
exports.getCart = (req, res, next) => {
    const userId = res.locals.userId;
    User
        .findById(userId)
        .populate('cart.items.productId')
        .then(user => {
            const products = user.cart.items;
            res.render('./shop/cart', {
                pageTitle: "Cart",
                path: "/cart",
                prods: products
            });
        })
        .catch(err => {
            next(err);
        });
}

//getting prod id from req, fetching and adding to cart prod data from the db, redirecting to cart
exports.postCart = (req, res, next) => {
    const userId = res.locals.userId;
    const cartProductId = req.body.productId;
    let foundProduct;
    Product
        .findById(cartProductId)
        .then(product => {
            foundProduct = product;
            return User.findById(userId);
        })
        .then(user => {
            return user.addToCart(foundProduct);
        })
        .then(() => {
            res.redirect('/cart');
        })
        .catch(err => {
            next(err);
        });
}

//geting prod id from req, removing product from db and redirecting to cart
exports.removeFromCart = (req, res, next) => {
    const userId = res.locals.userId;
    const prodId = req.body.productId;
    User
        .findById(userId)
        .then(user => {
            return user.removeFromCart(prodId);
        })
        .then(() => {
            res.redirect('/cart');
        })
        .catch(err => {
            next(err);
        });
}

// exports.getCheckout = (req, res, next) => {
//     res.render('./shop/checkout', {
//         pageTitle: "Checkout",
//         path: "/cart/checkout"
//     });
// }

//fetching all orders that match userid from the db, populating them with product data and rendering orders page
exports.getOrders = (req, res, next) => {
    const userId = res.locals.userId;
    Order
        .find({
            userId: userId,
        })
        .select('items')
        .populate('items.productId', 'title')
        .then(orders => {
            res.render('./shop/orders', {
                pageTitle: "Orders",
                path: "/orders",
                orders: orders
            });
        })
        .catch(err => {
            next(err);
        });
}

//creating a new order from current user cart products and clearing current user cart, redirecting to orders
exports.postOrder = (req, res, next) => {
    const userId = res.locals.userId;
    User
        .findById(userId)
        .then(user => {
            return user.addOrder();
        })
        .then(() => {
            res.redirect('/orders');
        })
        .catch(err => {
            next(err);
        });
}

exports.getInvoice = (req, res, next) => {
    const orderId = req.params.orderId;
    Order
        .findById(orderId)
        .populate('items.productId')
        .then(order => {
            if (!order) {
                throw new Error('NO_ORDER_FOUND');
            }
            if (order.userId.toString() !== res.locals.userId) {
                throw new Error('AUTH_CHECK_FAILED');
            }
            const invoiceName = 'invoice_' + orderId + '.pdf';
            //const invoicePath = path.join('data','invoice', invoiceName)
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');
            const pdfDoc = new PDFDocument();
            pdfDoc.pipe(res);
            pdfDoc.fontSize(26).text('Invoice');
            pdfDoc.fontSize(20).text('_______________________');
            pdfDoc.moveDown();
            let counter = 0;
            order.items.forEach(prod => {
                counter = counter + (prod.quantity * prod.productId.price);
                pdfDoc.fontSize(14).text('-' + prod.productId.title + ' (' + prod.quantity + ') $' + (prod.productId.price * prod.quantity));
            });
            pdfDoc.fontSize(20).text('_______________________');
            pdfDoc.moveDown();
            pdfDoc.fontSize(20).text('Total price: $' + counter);
            pdfDoc.end();
        })
        .catch(err => {
            next(err);
        });
}



