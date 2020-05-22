const Error = require('server-api-errors').Error;

// code, message, target, details, innererror 
const ValidationError = (target, details, innererror) => Error(
    "MissingParameter",
    target + " is required in the request.",
    target,
    details, 
    innererror
);

module.exports = exports = ValidationError;