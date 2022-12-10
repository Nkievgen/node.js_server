const mongoose = require('mongoose');
const Order = require('./order');
const Schema = mongoose.Schema;
const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    passwordReset: {
        token: String,
        expiration: Date
    },
    checkout: {
        token: String,
        expiration: Date
    },
    cart: {
        items: [{
            productId: {type: Schema.Types.ObjectId, ref: 'Product', required: true},
            quantity: {type: Number, required: true}
        }]
    }
});

//checking if there are any products in cart and then either adding it to cart or increasing quantity if the product is already there
userSchema.methods.addToCart = function(product) {
    const cartProductIndex = this.cart.items.findIndex(cp => {
        return cp.productId.toString() === product._id.toString();
    });
    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];
    if (cartProductIndex >= 0) {
        newQuantity = this.cart.items[cartProductIndex].quantity + 1;
        updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
        updatedCartItems.push({
            productId: product._id,
            quantity: newQuantity
        });
    }
    const updatedCart = {
        items: updatedCartItems
    };
    this.cart = updatedCart;
    return this.save();
}

//removing product from cart if its quantity === 1 or decrementing the quanitiy if its more than 1
userSchema.methods.removeFromCart = function(productId) {
    const updatedCartItems = [...this.cart.items];
    const prodIndex = updatedCartItems.findIndex(
        item => item.productId.toString() === productId.toString()
    );

    if (updatedCartItems[prodIndex].quantity === 1) {
        updatedCartItems.splice(prodIndex, 1);
    } else {
        updatedCartItems[prodIndex].quantity = updatedCartItems[prodIndex].quantity - 1;
    }
    
    this.cart.items = updatedCartItems;
    return this.save();
}

//adding all products in current user cart to orders and then clearing cart
userSchema.methods.addOrder = function() {
    const order = new Order({
        userId: this._id,
        items: this.cart.items
    });
    this.cart.items = [];
    return order
        .save()
        .then(() => {
            return this.save();
        });
    }

module.exports = mongoose.model('User', userSchema);