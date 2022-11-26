const Product = require('../models/product');
const Order = require('../models/order');
const User = require('../models/user');
const passToErrHandler = require('../util/pass-to-err-handler');

//fetching products from the db and rendering index page
exports.getIndex = (req, res, next) => {
    Product
        .find()
        .then(products => {
            res.render('./shop/index', {
                prods: products,
                pageTitle: "Shop",
                path: "/"
            });
        })
        .catch(err => {
            passToErrHandler(err, req, res, next);  
        });
}

//fetching products from the db and rendering index page
exports.getProductList = (req, res, next) => {
    Product
        .find()
        .then(products => {
            res.render('./shop/product-list',{
                prods: products,
                pageTitle: "Product List",
                path: "/product-list"
            });
        })
        .catch(err => {
            passToErrHandler(err, req, res, next);  
        });
}

//fetching product data for a specific product and rendering product details page
exports.getProductDetails = (req, res, next) => {
    const searchId = req.params.productId;
    Product
        .findById(searchId)
        .then(product => {
            res.render('./shop/product-details',{
                product: product,
                pageTitle: product.title,
                path: "/product-list"
            });
        })
        .catch(err => {
            passToErrHandler(err, req, res, next);          
        });
}

//fetching cart data from the db and rendering cart page
exports.getCart = (req, res, next) => {
    const userId = req.session.user._id;
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
            passToErrHandler(err, req, res, next);
        });
}

//getting prod id from req, fetching and adding to cart prod data from the db, redirecting to cart
exports.postCart = (req, res, next) => {
    const userId = req.session.user._id;
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
            passToErrHandler(err, req, res, next);  
        });
}

//geting prod id from req, removing product from db and redirecting to cart
exports.removeFromCart = (req, res, next) => {
    const userId = req.session.user._id;
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
            passToErrHandler(err, req, res, next);
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
    const userId = req.session.user._id;
    
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
            passToErrHandler(err, req, res, next);
        }); 
}

//creating a new order from current user cart products and clearing current user cart, redirecting to orders
exports.postOrder = (req, res, next) => {
    const userId = req.session.user._id;
    User
        .findById(userId)
        .then(user => {
            return user.addOrder();
        })
        .then(() => {
            res.redirect('/orders');
        })
        .catch(err => {
            passToErrHandler(err, req, res, next);
        });
}




