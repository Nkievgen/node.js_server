module.exports = [
    (error, req, res, next) => {
        console.log('internal server error: ' + error);
        res.status(500).render('./errors/500', {
            pageTitle: 'Internal Server Error',
            path: null,
        })
    }
]