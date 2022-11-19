const crypto = require('crypto');

const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

const User = require('../models/user');
const SENDGRID_API_KEY = require('../keys/sendgrid-key');

const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: SENDGRID_API_KEY
    }
}));

//rendering login page
exports.getLogin = (req, res, next) => {
    res.render('./auth/login', {
        pageTitle: "Login",
        path: "/login"
    })
};

//fetching user from the db, comparing password hash and storing userdata in the session
exports.postLogin = (req, res, next) => {
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
                req.session.save(() => {
                    res.redirect('/');
                });
            } else {
                throw new Error('WRONG_PASSWORD');
            }
        })
        .catch(err=> {
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
            // transporter.sendMail({
            //     to: email,
            //     from: 'node_web_app@test.com',
            //     subject: 'Welcome email',
            //     html: '<h1>You have successfully signed up!</h1>'
            // });
            return;
        })
        .then(() => {
            const message = 'Welcome email sent to ' + email;
            req.flash('message', message);
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
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/');
    });
}

//rendering password reset page
exports.getReset = (req, res, next) => {
    res.render('./auth/reset', {
        pageTitle: "Password reset",
        path: "/password-reset"
    });
}

exports.postReset = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err);
            return res.redirect('/reset');
        }
        const token = buffer.toString('hex');
        const userEmail = req.body.email;
        User
            .findOne({
                email: userEmail
            })
            .then(user => {
                if (!user) {
                    throw new Error('USER_NOT_FOUND');
                }
                user.passwordReset.token = token;
                const oneHour = 3600000;
                user.passwordReset.expiration = Date.now() + oneHour;
                return user.save();
            })
            .then(() => {
                // transporter.sendMail({
                //     to: req.body.email,
                //     from: 'node_web_app@test.com',
                //     subject: 'Password reset',
                //     html: '<p>Click <a href="http://localhost:3000/reset/${token}">here</a> to set a new password</p>'
                // });
                console.log('http://localhost:3000/set-password/' + token);
                req.flash('message', 'Please check your inbox to set a new password');
                res.redirect('/login');  
            })
            .catch(err => {
                console.log(err);
                switch(err.message) {
                    case 'USER_NOT_FOUND':
                        req.flash('error', 'No account found with that email address');
                        break;
                    default:
                        req.flash('error', 'Unexpected error happened');
                        break;
                }
                res.redirect('/password-reset');
            });
    })
}

exports.getSetPassword = (req, res, next) => {
    const token = req.params.token;
    User
        .findOne({
            'passwordReset.expiration': {$gt: Date.now()},
            'passwordReset.token': token,
        })
        .then(user => {
            if (!user){
                throw new Error('USER_NOT_FOUND');
            }
            const foundUserId = user._id.toString();
            res.render('./auth/set-password', {
                pageTitle: 'Set Password',
                path: '/set-password',
                passwordUserId: foundUserId,
                passwordToken: token
            });
        })
        .catch(err => {
            console.log(err);
            req.flash('error', 'Invalid or overdue password reset link');
            res.redirect('/login');
        });
}

exports.postSetPassword = (req, res, next) => {
    const newPassword = req.body.password;
    const userId = req.body.passwordUserId;
    const token = req.body.passwordToken;
    let foundUser;
    User
        .findOne({
            'passwordReset.expiration': {$gt: Date.now()},
            'passwordReset.token': token,
            _id: userId
        })
        .then(user => {
            if (!user) {
                throw new Error('USER_NOT_FOUND');
            }
            foundUser = user;
            return bcrypt.hash(newPassword, 12);
        })
        .then(hashedPassword => {
            foundUser.password = hashedPassword;
            foundUser.passwordReset.token = undefined;
            foundUser.passwordReset.expiration = undefined;
            return foundUser.save();
        })
        .then(() => {
            req.flash('message', 'Password changed successfully');
            res.redirect('/login');
        })
        .catch(err => {
            console.log(err)
            req.flash('error', 'Invalid or overdue password reset link');
            res.redirect('/login');
        });
}