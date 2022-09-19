const Product = require('../models/product');
const Order = require('../models/order');

//fetches products from db and renders index page, same as product list page
exports.getIndex = (req, res, next) => {
    console.log('handling get index request');
    Product
        .find()
        .then(products => {
            console.log('sending index page', '\n');
            res.render('./shop/index', {
                prods: products,
                pageTitle: "Shop",
                path: "/"
            });
        }).catch(err =>
            console.log(err)
        );
}

//fetches products from db and renders product list page
exports.getProductList = (req, res, next) => {
    console.log('handling get product list request');
    Product
        .find()
        .then(products => {
            console.log('sending product list page', '\n');
            res.render('./shop/product-list',{
                prods: products,
                pageTitle: "Product List",
                path: "/product-list"
            });
        })
        .catch(err =>
            console.log(err)
        );
}

//fetches product data for a specific product and passes it to prod details page
exports.getProductDetails = (req, res, next) => {
    const searchId = req.params.productId;
    console.log('handling get product details request');
    Product
        .findById(searchId)
        .then(product => {
            console.log('sending product details page', '\n');
            res.render('./shop/product-details',{
                product: product,
                pageTitle: product.title,
                path: "/product-list"
            });
        })
        .catch(err =>
            console.log(err)
        );
}

//fetches cart data from user model and renders cart controller
exports.getCart = (req, res, next) => {
    console.log('handling get cart request');
    req.user
        .populate('cart.items.productId')
        .then(user => {
            const products = user.cart.items;
            res.render('./shop/cart', {
                pageTitle: "Cart",
                path: "/cart",
                prods: products,
            });
        })
        .catch(err => console.log(err));
}

//gets a prod id from request, fetches prod data and adds it to cart, redirects to cart controller
exports.postCart = (req, res, next) => {
    console.log('handling post cart request');
    const cartProductId = req.body.productId;
    Product
        .findById(cartProductId)
        .then(product => {
            return req.user.addToCart(product)
        })
        .then(() => {
            res.redirect('/cart');
        })
        .catch(err => console.log(err));
}

//gets an id from request, removes product form db and redirects to cart controlelr
exports.removeFromCart = (req, res, next) => {
    console.log('handling remove product from cart request');
    const prodId = req.body.productId;
    req.user
        .removeFromCart(prodId)
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
    Order
        .find({
            userId: req.user._id,
        })
        .select('items')
        .populate('items.productId', 'title')
        .then(orders => {
            console.log('sending orders page', '\n');
            res.render('./shop/orders', {
                pageTitle: "Orders",
                path: "/orders",
                orders: orders
            });
        })
        .catch(err => console.log(err));    
}

//adds all current cart products to a new order, clears cart and redirects to orders controller
exports.postOrder = (req, res, next) => {
    req.user
        .addOrder()
        .then(() => {
            res.redirect('/orders');
        })
        .catch(err => console.log(err));
}




