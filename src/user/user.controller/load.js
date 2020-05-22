"use strict";

const User    = require('../user.model'),
      debug    = require('debug')('User'),
      apiError = require('server-api-errors'),
      errors   = require('../../errors');

 async function load( req, res, next, userId ){
    try {
        let userDoc = await User.findById(userId);
        if ( !userDoc )
            return next( apiError.BadRequest(errors.DocumentNotFound('User')));
        req.userDoc = userDoc;
        return next();
    } catch( error ){
        debug(error);
        return next( apiError.BadRequest() );
    };
};

module.exports = exports = load;