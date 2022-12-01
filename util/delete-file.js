const fs = require('fs');

const deleteFile = (filePath) => {
    fs.access(filePath, (err) => {
        if (!err) {
            fs.unlink(filePath, (err) => {
                if (err) {
                    throw (err);
                }
            })
        }
    })
    
}

module.exports = deleteFile;