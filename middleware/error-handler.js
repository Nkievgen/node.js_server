module.exports = [
    (error, req, res, next) => {
        console.log('internal server error: ' + error);
        if (res.locals.userId === undefined) {
            res.locals.userId = false;
        }
        if (res.locals.userEmail === undefined) {
            res.locals.userEmail = '';
        }
        res.status(500).render('./errors/500', {
            pageTitle: 'Internal Server Error',
            path: null,
        })
    }
]