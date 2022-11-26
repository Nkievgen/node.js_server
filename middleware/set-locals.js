module.exports = (req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    if (req.session.user) {
        res.locals.userId = req.session.user._id;
        res.locals.userEmail = req.session.user.email;
    } else {
        res.locals.userId = false;
        res.locals.userEmail = false;
    }
    let messages = req.flash('message');
    let errorMessages = req.flash('error');
    if (messages.length > 0) {
        res.locals.messages = messages;
    } else {
        res.locals.messages = [];
    }
    if (errorMessages.length > 0) {
        res.locals.errorMessages = errorMessages;
    } else {
        res.locals.errorMessages = [];
    }
    next();
}