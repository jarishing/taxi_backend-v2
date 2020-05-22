const User = require('../user.model'),
      debug = require('debug')('User'),
      ApiError = require('server-api-errors'); 

async function deleteAccount(req, res, next) {
    try{
        let user = req.userDoc;

        user.remove();
        return res.send( 'The account have been removed' );

    } catch( error ){
        console.log(error);
        return next(ApiError.BadRequest());
    }
}

module.exports = exports = deleteAccount;