const Error = require('server-api-errors').Error;

// code, message, target, details, innererror 
const ValidationError = (message, target, details, innererror) => Error(
    "ValidationError",
    message,
    target,
    details, 
    innererror
);

module.exports = exports = ValidationError;