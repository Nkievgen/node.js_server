exports.pageNotFound = (req, res, next) => {
    console.log('sending page not found page', '\n');
    let userId;
    let userName;
    if (req.session.user) {
        userId = req.session.user._id;
        userName = req.session.user.name;
    } else {
        userId = false;
        userName = false;
    }
    res.status(404).render('./errors/404', {
        pageTitle: "Not Found",
        path: null,
        userId: userId,
        userName: userName
    })
}