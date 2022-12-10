const WRONG_AUTH_MESSAGE = 'Wrong auth';
const EXCEEDS_PAGE_MESSAGE = 'Query exceeds last page';
const WRONG_PASSWORD_OR_EMAIL_MESSAGE = 'Wrong password or email';
const WRONG_TOKEN_MESSAGE = 'Wrong or expired token';

module.exports = [
    (error, req, res, next) => { // admin errors
        switch(error.message) {
            case 'EDIT_PRODUCT_AUTH_CHECK_FAILED':
                req.flash('error', WRONG_AUTH_MESSAGE);
                res.redirect('back');
                break;
            case 'ADMIN_PRODUCT_LIST_EXCEEDS_LAST_PAGE':
                res.flash('error', EXCEEDS_PAGE_MESSAGE);
                res.redirect('/admin/product-list?page=1');
                break;
            case 'POST_EDIT_PRODUCT_AUTH_CHECK_FAILED':
                res.flash('error', WRONG_AUTH_MESSAGE);
                res.redirect('/admin/product-list');
                break;
            case 'DELETE_PRODUCT_WRONG_AUTH_OR_ID':
                res.status(400).json({
                    message: 'Wrong auth or id'
                })
                break;
            default:
                next(error);
                break;
        }
    },
    (error, req, res, next) => { // auth errors
        switch(error.message) {
            case 'POST_SET_PASS_USER_NOT_FOUND':
                res.flash('error', WRONG_TOKEN_MESSAGE);
                res.redirect('/reset-password');
                break;
            case 'GET_SET_PASS_USER_NOT_FOUND':
                res.flash('error', WRONG_TOKEN_MESSAGE);
                res.redirect('/reset-password');
                break;
            case 'POST_RESET_USER_NOT_FOUND':
                res.flash('error', 'Email not found');
                res.redirect('/reset-password');
                break;
            case 'POST_LOGIN_WRONG_PASSWORD':
                res.flash('error', WRONG_PASSWORD_OR_EMAIL_MESSAGE);
                res.redirect('/login');
                break;
            case 'POST_LOGIN_EMAIL_NOT_FOUND':
                res.flash('error', WRONG_PASSWORD_OR_EMAIL_MESSAGE);
                res.redirect('/login');
                break;
            default:
                next(error);
                break;
        }
    },
    (error, req, res, next) => { //shop errs
        switch(error.message) {
            case 'GET_INDEX_EXCEEDS_LAST_PAGE':
                res.flash('error', EXCEEDS_PAGE_MESSAGE);
                res.redirect('/?page=1');
                break;
            case 'GET_PRODUCT_LIST_EXCEEDS_LAST_PAGE':
                res.flash('error', EXCEEDS_PAGE_MESSAGE);
                res.redirect('/?page=1');
            case 'GET_CHECKOUT_SUCCESS_WRONG_TOKEN':
                res.flash('error', WRONG_TOKEN_MESSAGE);
                res.redirect('/cart/checkout');
            case 'GET_CHECKOUT_SUCCESS_EXPIRED':
                res.flash('error', WRONG_TOKEN_MESSAGE);
                res.redirect('/cart/checkout');
            case 'GET_CHECKOUT_CANCEL_WRONG_TOKEN':
                res.flash('error', WRONG_TOKEN_MESSAGE);
                res.redirect('/cart/checkout');
            case 'GET_CHECKOUT_CANCEL_EXPIRED':
                res.flash('error', WRONG_TOKEN_MESSAGE);
                res.redirect('/cart/checkout');
            default:
                next(error);
                break;
        }
    },
    (error, req, res, next) => {
        console.log('internal server error: ', error);
        res.status(500).render('./errors/500', {
            pageTitle: 'Internal Server Error',
            path: null,
        })
    }
]