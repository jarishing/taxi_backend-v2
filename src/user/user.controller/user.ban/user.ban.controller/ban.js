const User = require('../../../user.model'),
      apiError = require('server-api-errors'),
      errors   = require('../../../../errors'),
      debug    = require('debug')('User');

async function ban( req, res, next ){

    try{
        const bannedUser = await User.findById(req.params.userId);

        if(!bannedUser)
            return next( apiError.BadRequest(errors.DocumentNotFound('User')));
        
        bannedUser.ban = true;
        await bannedUser.save();
        return res.json({
            data: bannedUser
        });
    } catch( error ){
        debug(error)
        return next( apiError.InternalServerError() );
    }
};

module.exports = exports = ban;