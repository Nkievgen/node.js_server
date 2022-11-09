const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const mongoDbStore = require('connect-mongodb-session')(session);

const MONGODB_URI = require('./mongodburi');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const errorRoutes = require('./routes/errors');
const authRoutes = require('./routes/auth');

const User = require('./models/user');

const app = express();
const store = new mongoDbStore({
    uri: MONGODB_URI,
    collection: 'sessions'
});

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
    session({
        secret: 'secret placeholder',
        resave: false,
        saveUninitialized: false,
        store: store
    })
);

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorRoutes);

//connects to the database and then launches server if successfull
mongoose
.connect(
    MONGODB_URI
)
.then(() => {
    console.log('mongodb connection successfull');
    // const newUser = new User({
    //     name: 'User2',
    //     email: 'user2@test.com',
    //     cart: {
    //         items: []
    //     }
    // })
    // newUser.save();
    app.listen(3000);
    console.log('listening...');
})
.catch(err => {
    console.log(err);
})