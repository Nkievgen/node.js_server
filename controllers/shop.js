const Product = require('../models/product');
const Order = require('../models/order');
const User = require('../models/user');

//fetches products from db and renders index page, same as product list page
exports.getIndex = (req, res, next) => {
    console.log('handling get index request');
    let userId;
    let userName;
    if (req.session.user) {
        userId = req.session.user._id;
        userName = req.session.user.name;
    } else {
        userId = false;
        userName = false;
    }
    Product
        .find()
        .then(products => {
            console.log('sending index page', '\n');
            res.render('./shop/index', {
                prods: products,
                pageTitle: "Shop",
                path: "/",
                userId: userId,
                userName: userName
            });
        }).catch(err =>
            console.log(err)
        );
}

//fetches products from db and renders product list page
exports.getProductList = (req, res, next) => {
    console.log('handling get product list request');
    let userId;
    let userName;
    if (req.session.user) {
        userId = req.session.user._id;
        userName = req.session.user.name;
    } else {
        userId = false;
        userName = false;
    }
    Product
        .find()
        .then(products => {
            console.log('sending product list page', '\n');
            res.render('./shop/product-list',{
                prods: products,
                pageTitle: "Product List",
                path: "/product-list",
                userId: userId,
                userName: userName
            });
        })
        .catch(err =>
            console.log(err)
        );
}

//fetches product data for a specific product and passes it to prod details page
exports.getProductDetails = (req, res, next) => {
    const searchId = req.params.productId;
    let userId;
    let userName;
    if (req.session.user) {
        userId = req.session.user._id;
        userName = req.session.user.name;
    } else {
        userId = false;
        userName = false;
    }
    console.log('handling get product details request');
    Product
        .findById(searchId)
        .then(product => {
            console.log('sending product details page', '\n');
            res.render('./shop/product-details',{
                product: product,
                pageTitle: product.title,
                path: "/product-list",
                userId: userId,
                userName: userName
            });
        })
        .catch(err =>
            console.log(err)
        );
}

//fetches cart data from user model and renders cart controller
exports.getCart = (req, res, next) => {
    console.log('handling get cart request');
    //console.log('session user: ' + req.session.user);
    let userId;
    let userName;
    if (req.session.user) {
        userId = req.session.user._id;
        userName = req.session.user.name;
    } else {
        res.redirect('/login');
    }
    User
        .findById(userId)
        .populate('cart.items.productId')
        .then(user => {
            const products = user.cart.items;
            res.render('./shop/cart', {
                pageTitle: "Cart",
                path: "/cart",
                prods: products,
                userId: userId,
                userName: userName
            });
        })
        .catch(err => console.log(err));
}

//gets a prod id from request, fetches prod data and adds it to cart, redirects to cart controller
exports.postCart = (req, res, next) => {
    console.log('handling post cart request');
    let userId;
    let userName;
    if (req.session.user) {
        userId = req.session.user._id;
        userName = req.session.user.name;
    } else {
        res.redirect('/login');
    }
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
        .catch(err => console.log(err));
}

//gets an id from request, removes product form db and redirects to cart controlelr
exports.removeFromCart = (req, res, next) => {
    console.log('handling remove product from cart request');
    let userId;
    let userName;
    if (req.session.user) {
        userId = req.session.user._id;
        userName = req.session.user.name;
    } else {
        res.redirect('/login');
    }
    const prodId = req.body.productId;
    User
        .findById(userId)
        .then(user => {
            return user.removeFromCart(prodId);
        })
        .then(() => {
            res.redirect('/cart');
        })
        .catch(err => console.log(err))

}

// exports.getCheckout = (req, res, next) => {
//     console.log('handling get checkout request');
//     console.log('sending checkout page', '\n');
//     res.render('./shop/checkout', {
//         pageTitle: "Checkout",
//         path: "/cart/checkout"
//     });
// }

//fetches all orders that match userid, populates them with product data and passes it to orders page
exports.getOrders = (req, res, next) => {
    console.log('handling get orders request');
    let userId;
    let userName;
    if (req.session.user) {
        userId = req.session.user._id;
        userName = req.session.user.name;
    } else {
        res.redirect('/login');
    }
    Order
        .find({
            userId: userId,
        })
        .select('items')
        .populate('items.productId', 'title')
        .then(orders => {
            console.log('sending orders page', '\n');
            res.render('./shop/orders', {
                pageTitle: "Orders",
                path: "/orders",
                orders: orders,
                userId: userId,
                userName: userName
            });
        })
        .catch(err => console.log(err));    
}

//adds all current cart products to a new order, clears cart and redirects to orders controller
exports.postOrder = (req, res, next) => {
    console.log('handling post order request');
    let userId;
    if (req.session.user) {
        userId = req.session.user._id;
    } else {
        res.redirect('/login');
    }
    User
        .findById(userId)
        .then(user => {
            return user.addOrder();
        })
        .then(() => {
            res.redirect('/orders');
        })
        .catch(err => console.log(err));
}




