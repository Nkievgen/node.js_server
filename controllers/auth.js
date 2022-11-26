const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const { validationResult } = require('express-validator');
const User = require('../models/user');
const messagesToLocals = require('../util/messages-to-locals');
const SENDGRID_API_KEY = require('../keys/sendgrid-key');
const passToErrHandler = require('../util/pass-to-err-handler');

const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: SENDGRID_API_KEY
    }
}));

const renderSignup = function(req, res, next, savedEmail = '', validationErrors = []) {
    if (validationErrors.length > 0) {
        res.status(422);
    }
    res.render('./auth/signup', {
        pageTitle: "Signup",
        path: "/signup",
        savedEmail: savedEmail,
        validationErrors: validationErrors
    });
}

const renderLogin = function(req, res, next, savedEmail = '', validationErrors = []) {
    if (validationErrors.length > 0) {
        res.status(422);
    }
    res.render('./auth/login', {
        pageTitle: "Login",
        path: "/login",
        savedEmail: savedEmail,
        validationErrors: validationErrors
    })
}

//rendering login page
exports.getLogin = (req, res, next) => {
    renderLogin(req, res, next);
};

//fetching user from the db, comparing password hash and storing userdata in the session
exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        messagesToLocals(errors.array(), res);
        return renderLogin(req, res, next, email, errors.array());
    }
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
            switch (err.message) {
                case 'EMAIL_NOT_FOUND':
                    req.flash('error', 'Invalid email or password');
                    break;
                case 'WRONG_PASSWORD':
                    req.flash('error', 'Invalid email or password');
                    break;
                default:
                    passToErrHandler(err, req, res, next);
                    break;
            }
            res.redirect('/login');
        })
}

//rendering signup page
exports.getSignup = (req, res, next) => {
    renderSignup(req, res, next);
}

//looking for the email in the db and creating new user if email is not found, redirecting to index
exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        messagesToLocals(errors.array(), res);
        return renderSignup(req, res, next, email, errors.array());
    }
    User
        .find({
            email: email
        })
        .then(user => {
            if(user) {
                throw new Error('USER_ALREADY_EXISTS');
            }
            const salt = 12;
            return bcrypt.hash(password, salt);
        })
        .then(hashedPassword => {
            const user = new User({
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
            if(err.message === 'USER_ALREADY_EXISTS') {
                res.locals.errorMessages.push('Email already taken');
                const wrongEmail = [{param: 'email'}]
                renderSignup(req, res, next, email, wrongEmail);
            } else {
                passToErrHandler(err, req, res, next);
            }
        });
}

//erasing session data and redirecting to index
exports.postLogout =(req, res, next) => {
    req.session.destroy(err => {
        if (err) {
            passToErrHandler(err, req, res, next);
        }
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
            passToErrHandler(err, req, res, next);
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
                switch(err.message) {
                    case 'USER_NOT_FOUND':
                        req.flash('error', 'No account found with that email address');
                        break;
                    default:
                        passToErrHandler(err, req, res, next);
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
            switch(err.message) {
                case 'USER_NOT_FOUND':
                    req.flash('error', 'Invalid or overdue password reset link');
                    break;
                default:
                    passToErrHandler(err, req, res, next);
                    break;
            }
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
            switch(err.message) {
                case 'USER_NOT_FOUND':
                    req.flash('error', 'Invalid or overdue password reset link');
                    break;
                default:
                    passToErrHandler(err, req, res, next);
                    break;
            }
            res.redirect('/login');
        });
}