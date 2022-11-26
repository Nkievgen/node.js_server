module.exports = (err, req, res, next) => {
    const error = new Error(err);
    next(error);
}