module.exports = (req, res, next) => {
    if (!req.session.user) {
        const firstMessage = 'Authorization required to ';
        let secondMessage;
        const path = req.path;
        switch (path) {
            case '/cart':
                req.method === 'POST'
                    ? secondMessage = 'add products to cart'
                    : secondMessage = 'access cart'
                break;
            case '/remove-from-cart':
                secondMessage = 'remove products from cart'
                break;
            case '/orders':
                secondMessage = 'access orders'
                break;
            case '/create-order':
                secondMessage = 'create order'
                break;
            case '/add-product':
                secondMessage = 'add products'
                break;
            case '/edit-product':
                secondMessage = 'edit products'
                break;
            case '/delete-product':
                secondMessage = 'delete products'
                break;
            default:
                secondMessage = 'access this page'
                break;
        }
        const message = firstMessage + secondMessage;
        req.flash('message', message);
        return res.redirect('/login');
    }
    next();
}