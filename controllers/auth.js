const User = require('../models/user');

exports.getLogin = (req, res, next) => {
    console.log('rendering login page');
    let userId;
    let userName;
    if (req.session.user) {
        userId = req.session.user._id;
        userName = req.session.user.name;
    } else {
        userId = false;
        userName = false;
    }
    res.render('./auth/login', {
        pageTitle: "Login",
        path: "/login",
        userId: userId,
        userName: userName
    });
};

exports.postLogin = (req, res, next) => {
    console.log('handling post login');
    User
        .findOne({
            email: req.body.email
        })
        .then(user => {
            req.session.user = user;
            console.log('login successful');
            res.redirect('/');
        })
        .catch(err=> {
            console.log(err);
            console.log('login failed');
            res.redirect('/');
        })
}