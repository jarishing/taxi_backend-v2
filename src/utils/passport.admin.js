const LocalStrategy = require("passport-local").Strategy,
      User          = require("../user/user.model"),
      apiError      = require("server-api-errors"),
      debug         = require('debug')('passport'),
      errors        = require('../errors');

async function Validate(email, password, callback){
    try {
        const user = await User.findOne({ email: email });
        if ( user ){
            if ( user.validPassword(password) == false )
                return callback(null, null, errors.ValidationError("Password not match", "password"));
            return callback(null, user, null);
        } else 
            return callback(null, null, errors.ValidationError("User not found", "email"));
    } catch ( error ){
        debug(error);
        return callback(error, null, apiError.InternalServerError() );
    }
};

module.exports = exports = new LocalStrategy({usernameField: 'email'}, Validate);