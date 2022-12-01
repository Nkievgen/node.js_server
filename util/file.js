const multer = require('multer');

exports.storage = multer.diskStorage({
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

exports.filter = (req, file, cb) => {
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