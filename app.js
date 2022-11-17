const path = require('path');

//npm modules
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const mongoDbStore = require('connect-mongodb-session')(session);
const csurf = require('csurf');
const flash = require('connect-flash');

//file with mongodb connection link
const MONGODB_URI = require('./mongodburi');

//routes importting
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const errorRoutes = require('./routes/errors');
const authRoutes = require('./routes/auth');

const app = express();

//session storage
const store = new mongoDbStore({
    uri: MONGODB_URI,
    collection: 'sessions'
});

const csrfProtection = csurf();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: false}));

app.use(express.static(path.join(__dirname, 'public')));

//session initialization
app.use(
    session({
        secret: 'secret placeholder',
        resave: false,
        saveUninitialized: false,
        store: store
    })
);

app.use(flash());

app.use(csrfProtection);

//setting userId, userName and messages in locals
app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    if (req.session.user) {
        res.locals.userId = req.session.user._id;
        res.locals.userName = req.session.user.name;
    } else {
        res.locals.userId = false;
        res.locals.userName = false;
    }
    let message = req.flash('message');
    let errorMessage = req.flash('error');
    if (message.length > 0) {
        res.locals.message = message[0];
    } else {
        res.locals.message = false;
    }
    if (errorMessage.length > 0) {
        res.locals.errorMessage = errorMessage[0];
    } else {
        res.locals.errorMessage = false;
    }
    next();
})

//routes
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorRoutes);

//connecting to the database and starting to listen if successfull
mongoose
    .connect(MONGODB_URI)
    .then(() => {
        console.log('mongodb connection successfull');
        app.listen(3000);
        console.log('listening...');
    })
    .catch(err => {
        console.log(err);
    })