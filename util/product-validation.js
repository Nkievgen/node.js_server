const { body } = require('express-validator');

module.exports = [
    body('title')
    .notEmpty()
    .withMessage('Title is a required field')
    .if(
        body('title').notEmpty()
    )
    .isString()
    .withMessage('Title should be a string'),
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
    .isNumeric()
    .withMessage('Price should be numeric'),
body('description')
    .isString()
    .withMessage('Description should be a string'),
]
