const msgToLocals = function(array, res) {
    array.forEach(error => {
        res.locals.errorMessages.push(error.msg);
    });
    return;
}

module.exports = msgToLocals;