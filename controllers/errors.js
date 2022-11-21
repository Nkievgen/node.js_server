exports.pageNotFound = (req, res, next) => {
    res.status(404).render('./errors/404', {
        pageTitle: "Not Found",
        path: null
    })
}