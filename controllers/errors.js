exports.pageNotFound = (req, res, next) => {
    console.log('sending page not found page', '\n');
    res.status(404).render('./errors/404', {pageTitle: "Not Found", path: null})
}