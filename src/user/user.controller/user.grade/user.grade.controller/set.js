const User = require('../../../user.model'),
      apiError = require('server-api-errors'),
      error = require('../../../../errors'),
      debug = require('debug')('User');


async function set( req, res, next ){
    const grade = req.body.grade;

    try{
        let Driver = await User.findById( req.params.userId );
        
        if( !Driver )
            return next( apiError.BadRequest(errors.DocumentNotFound('User')));

        switch( grade ){ 
            case 'S':
                Driver.grade = grade;
                break;
            case 'A':
                Driver.grade = grade;
                Driver.mark = 90;
                break;
            case 'B':
                Driver.grade = grade;
                Driver.mark = 70;
                break;
            case 'C':
                Driver.grade = grade;
                Driver.mark = 50;
                break;
            case 'D':
                Driver.grade = grade;
                Driver.mark = 30;
                break;
            case 'E':
                Driver.grade = grade;
                Driver.mark = 10;
                break;
            default:
                return next( apiError.BadRequest( errors.MissingParameter("grade")));
        };

        await Driver.save();
        return res.json({
            data: Driver
        })
    } catch( error ){
        debug(error)
        return next( apiError.InternalServerError() );
    }
};

module.exports = exports = set;