const User = require('../../../user.model'),
      apiError = require('server-api-errors'),
      errors   = require('../../../../errors'),
      debug    = require('debug')('User');

async function set( req, res, next ){
    try{
        const user = await User.findById(req.params.userId);

        if( !user )
            return next( apiError.BadRequest(errors.DocumentNotFound('User')));
        
        if( user.type !== 'driver' )
            return next(apiError.BadRequest());

        user.superClass = false;
        await user.save();
        return res.json({
            data: user
        })
    } catch( error ){
        debug(error)
        return next( apiError.InternalServerError() );
    }
};

module.exports = exports = set;