const path = require('path');

//npm modules
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const mongoDbStore = require('connect-mongodb-session')(session);
const csurf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');

//mongodb api key
const MONGODB_URI = require('./keys/mongodb-uri');

//middleware
const setLocals = require('./middleware/set-locals');
const errorHandler = require('./middleware/error-handler');

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

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        let fileExtension;
        switch(file.mimetype) {
            case 'image/png':
                fileExtension = '.png';
                break;
            case 'image/jpeg':
                fileExtension = '.jpeg';
                break;
        }
        let fileName = new Date().toISOString();
        target = new RegExp(/\.|:|-/, 'g'); //removes '.' OR '-' OR ':'
        fileName = fileName.replace(target, '') + fileExtension;
        cb(null, fileName);
    }
});

const fileFilter = (req, file, cb) => {
    let doSave = false;
    switch(file.mimetype) {
        case 'image/png':
            doSave = true;
            break;
        case 'image/jpeg':
            doSave = true;
            break;
    }
    cb(null, doSave);
}

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: false}));
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

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
app.use(setLocals); //setting userId, userEmail, messages and csrf token in locals

//routes
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorRoutes);
app.use(errorHandler);

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