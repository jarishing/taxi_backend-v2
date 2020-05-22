const apiError = require('server-api-errors'),
      Google = require('../../utils/googleService'),
      errors = require('../../errors');

async function findNearby( req, res, next ){
    if( !req.body.lat && !req.body.lng )
        return next(apiError.BadRequest());
    
    let data = await Google.searchNearBy( req.body.lat, req.body.lng );
    console.log(data);
}

module.exports = exports = findNearby;