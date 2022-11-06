const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const errorRoutes = require('./routes/errors');
const authRoutes = require('./routes/auth');

const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    User
        .findById('632048f1be3b57610c55b19b')
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorRoutes);


const mongodbUsername = 'nodejs_server';
const mongodbPassword = 'HStmJy1UnSJKEm0D';
const mongodbLink = 'cluster0.vcp6z5f';
const mongodbKey = 'mongodb+srv://' + mongodbUsername + ':' + mongodbPassword +'@' + mongodbLink + '.mongodb.net/shop?retryWrites=true&w=majority';

//connects to the database and then launches server if successfull
mongoose
.connect(
    mongodbKey
)
.then(() => {
    console.log('mongodb connection successfull');
    User
        //authentication flow is not yet implemented so there is only one user in the database
        .findOne()
        .then(user => {
            if (!user) {
                const newUser = new User({
                    name: 'User',
                    email: 'user@test.com',
                    cart: {
                        items: []
                    }
                })
                newUser.save();
            }
        })    
    app.listen(3000);
})
.catch(err => {
    console.log(err);
})