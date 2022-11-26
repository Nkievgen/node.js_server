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
const MONGODB_URI = require('./keys/mongodb-uri');

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
        res.locals.userEmail = req.session.user.email;
    } else {
        res.locals.userId = false;
        res.locals.userEmail = false;
    }
    let messages = req.flash('message');
    let errorMessages = req.flash('error');
    if (messages.length > 0) {
        res.locals.messages = messages;
    } else {
        res.locals.messages = [];
    }
    if (errorMessages.length > 0) {
        res.locals.errorMessages = errorMessages;
    } else {
        res.locals.errorMessages = [];
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