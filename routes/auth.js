const express = require('express');
const router = express.Router();

const isAuth = require('../middleware/is-auth');

const authController = require('../controllers/auth');

router.get('/login', authController.getLogin);

router.post('/login', authController.postLogin);

router.get('/signup', authController.getSignup);

router.post('/signup', authController.postSignup);

router.get('/password-reset', authController.getReset);

router.post('/password-reset', authController.postReset);

router.get('/set-password/:token', authController.getSetPassword);

router.post('/set-password', authController.postSetPassword);

router.post('/logout', isAuth, authController.postLogout);

module.exports = router;