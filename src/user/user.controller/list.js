const User     = require('../user.model'),
      SocketId = require('../../socket/socket.model'),
      debug    = require('debug')('User'),
      errors   = require('../../errors'),
      apiError = require('server-api-errors'); 

const entry = async( req, res, next ) => {
    switch( req.query.type ){
        case 'active':
            return getActiveUserList( req, res, next );
        case 'all':
            return getAllUserList( req, res, next );
        case 'nonVaild':
        case 'banned':
            return getStatusUserList( req, res, next );
        default:
            return next( apiError.BadRequest( errors.MissingParameter("type")));
    };   
};

async function getActiveUserList( req, res, next ){
    let conditions = { type: req.query.user };
    console.log(conditions);

    try{
        let users = await SocketId
                                .find(conditions)
                                .populate([
                                    {
                                        path: "user",
                                        select:'-__v -salt -hash'
                                    }
                                ])
                                .select( 'user' );

        let data = [];

        if(users.length == 0){
            data = null;
        }else{
            users.map( item  => {
                if(item){
                    data.push( item.user);
                }
            });
        }

        return res.send({ data: data });
    } catch( error ){
        console.log( error );
        return next( apiError.InternalServerError() );
    };
};


async function getAllUserList( req, res, next ){
    let conditions = { type: req.query.user };

    try{
        let users = await User
                                .find(conditions)
                                .select('-__v -salt -hash')
                                .lean();

        if(users.length == 0){
            users = null;
        }
        return res.send({ data: users});
    } catch( error ){
        console.log( error );
        return next( apiError.InternalServerError() );
    };
};

async function getStatusUserList( req, res, next ){

    let conditions = { $and:[ { type: 'driver' } ] };

    switch( req.query.type ){
        case 'nonVaild':
            conditions.$and.push( { valid: false } );
            break;
        case 'banned':
            conditions.$and.push( { ban: true } );
            break;
    };

    console.log( conditions )
    try{
        let users = await User
                                .find(conditions)
                                .select('-__v -salt -hash')
                                .lean();

        
        if(users.length == 0){
            users = null;
        }
        return res.send({ data: users});
    } catch( error ){
        console.log( error );
        return next( apiError.InternalServerError() );
    };
}

module.exports = exports = entry;