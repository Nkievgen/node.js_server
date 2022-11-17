const bcrypt = require('bcryptjs');

const User = require('../models/user');


//rendering login page
exports.getLogin = (req, res, next) => {
    console.log('rendering login page');
    res.render('./auth/login', {
        pageTitle: "Login",
        path: "/login"
    })
};

//fetching user from the db, comparing password hash and storing userdata in the session
exports.postLogin = (req, res, next) => {
    console.log('handling post login');
    const email = req.body.email;
    const password = req.body.password;
    let userData;
    User
        .findOne({
            email: email
        })
        .then(user => {
            if(!user) {
                throw new Error('EMAIL_NOT_FOUND');
            }
            userData = user;
            return bcrypt.compare(password, user.password);
        })
        .then(passwordCheck => {
            if (passwordCheck === true) {
                req.session.user = userData;
                console.log('login successful');
                req.session.save(() => {
                    res.redirect('/');
                });
            } else {
                throw new Error('WRONG_PASSWORD');
            }
        })
        .catch(err=> {
            console.log('login failed');
            console.log(err);
            switch (err.message) {
                case 'EMAIL_NOT_FOUND':
                    req.flash('error', 'Invalid email or password');
                    break;
                case 'WRONG_PASSWORD':
                    req.flash('error', 'Invalid email or password');
                    break;
                default:
                    req.flash('error', 'Unexpected error');
                    break;
            }
            res.redirect('/login');
        })
}

//rendering signup page
exports.getSignup = (req, res, next) => {
    res.render('./auth/signup', {
        pageTitle: "Signup",
        path: "/signup"
    });
}

//looking for the email in the db and creating new user if email is not found, redirecting to index
exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;
    User
        .findOne({email: email})
        .then(userData => {
            if(userData){
                throw new Error('EMAIL_EXISTS');
            }
            const salt = 12;
            return bcrypt.hash(password, salt);
        })
        .then(hashedPassword => {
            const user = new User({
                name: name,
                email: email,
                password: hashedPassword,
                cart: { items: [] }
            });
            return user.save();
        })
        .then(() => {
            res.redirect('/login');
        })
        .catch(err => {
            console.log(err);
            if (err.message === 'EMAIL_EXISTS') {
                req.flash('error', 'Email address already taken');
                res.redirect ('/signup');
            } else {
                req.flash('error', 'Unexpected error');
                res.redirect('/');
            }
        });
}

//erasing session data and redirecting to index
exports.postLogout =(req, res, next) => {
    console.log('handling post logout');
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/');
    });
}