const Error = require('server-api-errors').Error;

// code, message, target, details, innererror 
const DocumentNotFound = (target, details, innererror) => Error(
    target + "NotFound",
    "Can not retrieve the " + target + " document",
    target,
    details, 
    innererror
);

module.exports = exports = DocumentNotFound;