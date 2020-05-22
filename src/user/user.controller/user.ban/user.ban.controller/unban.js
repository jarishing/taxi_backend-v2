const User = require('../../../user.model'),
      apiError = require('server-api-errors'),
      errors   = require('../../../../errors'),
      debug    = require('debug')('User');

async function unban( req, res, next ){

    try{
        const unbannedUser = await User.findById(req.params.userId);

        if(!unbannedUser)
            return next( apiError.BadRequest(errors.DocumentNotFound('User')));
        
        unbannedUser.ban = false;
        await unbannedUser.save();
        return res.json({
            data: unbannedUser
        });
    } catch( error ){
        debug(error)
        return next( apiError.InternalServerError() );
    }
};

module.exports = exports = unban;