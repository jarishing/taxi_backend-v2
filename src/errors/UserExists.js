const Error = require('server-api-errors').Error;

// code, message, target, details, innererror 
const UserExists = (details, innererror) => Error(
    "UserExists",
    "Emails has been used",
    'email',
    details, 
    innererror
);

module.exports = exports = UserExists;