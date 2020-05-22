const passport = require("passport"),
      debug    = require('debug')('User'),
      errors   = require('server-api-errors'); 

const entry = async( req, res, next ) => {
    switch( req.body.type ){
        case 'admin':
            return adminLogin( req, res, next );
        default:
            return login( req, res, next );
    }
}

async function adminLogin( req, res, next ){
    passport.authenticate('local', function( error, user, info ){
        if ( error )
            return next( errors.InternalServerError() );
        if ( user ){
            const token = user.generateJwt();
            return res.send({ access_token: token, user });
        } else 
            return next( errors.Unauthorized( info ) );
    })(req, res, next);
}

async function login( req, res, next ){
    passport.authenticate('local', function( error, user, info ){
        if ( error )
            return next( errors.InternalServerError() );
        if ( user ){
            if( user.type != req.body.type )
                return next( errors.InternalServerError('user type error') );
            if( user.ban == true )
                return next( errors.Unauthorized( info ) );
            if( user.valid == false && user.type == 'driver' )
                return next( errors.Unauthorized( info ) );
            const token = user.generateJwt();
            return res.send({ access_token: token, user });
        } else 
            return next( errors.Unauthorized( info ) );
    })(req, res, next);
};

module.exports = exports = entry;