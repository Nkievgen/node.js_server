const { body } = require('express-validator');

module.exports = [
body('title')
    .notEmpty()
    .withMessage('Title is a required field')
    .if(
        body('title').notEmpty()
    )
    .isString()
    .withMessage('Title should consist only of characters and numbers')
    .trim(),
body('imageUrl')
    .trim()
    .if(
        body('imageUrl').notEmpty()
    )
    .isURL()
    .withMessage('Image URL should be a valid link'),
body('price')
    .notEmpty()
    .withMessage('Price is a required field')
    .if(
        body('price').notEmpty()
    )
    .isFloat()
    .withMessage('Price should be a number'),
body('description')
    .trim(),
]
