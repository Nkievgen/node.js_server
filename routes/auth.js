const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const isAuth = require('../middleware/is-auth');

const User = require('../models/user');
const authController = require('../controllers/auth');
const authValidation = require('../util/auth-validation');

router.get('/login',
    authController.getLogin
);

router.post('/login', 
    authValidation,    
    authController.postLogin
);

router.get('/signup',
    authController.getSignup
);

router.post('/signup',
    authValidation,
    body('confirmPassword')
        .trim()
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords have to match');
            } else {
                return true;
            }
        }),
    authController.postSignup
);

router.get('/password-reset',
    authController.getReset
);

router.post('/password-reset',
    authController.postReset
);

router.get('/set-password/:token',
    authController.getSetPassword
);

router.post('/set-password',
    authController.postSetPassword
);

router.post('/logout',
    isAuth,
    authController.postLogout
);

module.exports = router;