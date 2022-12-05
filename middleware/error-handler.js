module.exports = [
    (error, req, res, next) => {
        switch(error.message) {
            case 'WRONG_AUTH_OR_ID':
                req.flash('error', 'Authorization check failed');
                res.redirect('/admin/product-list');
                break;
            case 'EMAIL_NOT_FOUND':
                req.flash('error', 'Invalid email or password');
                res.redirect('/login');
                break;
            case 'WRONG_PASSWORD':
                req.flash('error', 'Invalid email or password');
                res.redirect('/login');
                break;
            case 'RESET_USER_NOT_FOUND':
                req.flash('error', 'No account found with that email address');
                res.redirect('/password-reset');
                break;
            case 'USER_NOT_FOUND':
                req.flash('error', 'Invalid or overdue password reset link');
                res.redirect('/login');
                break;
            case 'EXCEEDS_LAST_PAGE':
                req.flash('error', 'Query exceeds last page');
                res.redirect('back');
                break;
            case 'AUTH_CHECK_FAILED':
                req.flash('error', 'Authorization check failed');
                res.redirect('back');
                break;
            default:
                next(error);
                break;
        }
    },
    (error, req, res, next) => {
        console.log('internal server error: ' + error);
        res.status(500).render('./errors/500', {
            pageTitle: 'Internal Server Error',
            path: null,
        })
    }
]