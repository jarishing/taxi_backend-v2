const LocalStrategy = require("passport-local").Strategy,
      User          = require("../user/user.model"),
      apiError      = require("server-api-errors"),
      debug         = require('debug')('passport'),
      errors        = require('../errors');
      
async function Validate(req, telephone_no, password, callback){
    console.log( telephone_no, password );
    try {
        const user = await User.findOne({ $and: [{ telephone_no: telephone_no}, { type: req.body.type }] });
        if ( user ){
            if ( user.validPassword(password) == false )
                return callback(null, null, errors.ValidationError("Password not match", "password"));
            return callback(null, user, null);
        } else 
            return callback(null, null, errors.ValidationError("User not found", "telephone_no"));
    } catch ( error ){
        console.log( error );
        debug(error);
        return callback(error, null, apiError.InternalServerError() );
    }
};

module.exports = exports = 
new LocalStrategy({
    usernameField: 'telephone_no', 
    passwordField: 'password',
    passReqToCallback: true}, Validate );