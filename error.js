// error constructor
function PageError(name) {
    this.message = name;
    this.status = 404;
    Error.captureStackTrace(this, PageError);
}
PageError.prototype.name = 'PageError';

module.exports = PageError;