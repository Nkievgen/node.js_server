exports.getLogin = (req, res, next) => {
    console.log('rendering login page');
    res.render('./auth/login', {
        pageTitle: "Login",
        path: "/login"
    });
};

exports.postLogin = (req, res, next) => {
    console.log('handling post login');
    res.redirect('/');
}