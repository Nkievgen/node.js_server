const { body } = require('express-validator');

module.exports = [
    body('email', 'Please enter a valid email')
        .isEmail()
        .normalizeEmail(),
    body(
        'password',
        'Password should be at least 6 characters long'
    )
        .isLength({min: 6})
        .trim()
]