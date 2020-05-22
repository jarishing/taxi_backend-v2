const User     = require('../user.model'),
      debug    = require('debug')('User'),
      apiError = require('server-api-errors'),
      Socket   = require('../../socket/socket.model.js');

const entry = async (req, res, next) => {
    switch (req.user.type) {
        case 'admin':
            return searchUser( req, res, next);
        case 'user':
        case 'driver':
            return get( req, res, next );
        default: 
            return next( apiError.BadRequest( errors.ValidationError('Invalid user type', 'type')));
    }
}

async function get(req, res, next){
    // const userId = req.user._id;
    // console.log(userId);
    const userId = req.params.userId;

    try {
        const user = await User
                                .findById(userId)
                                .select('-__v -salt -hash')
                                .lean();

        let socket = await Socket
                        .findOne({ user: user._id })
                        .lean();

        if ( socket && socket.position)
            user.position = socket.position;
        
        return res.send({ data: user });
    } catch( error ){
        debug(error)
        return next( apiError.BadRequest() );
    }

};

async function searchUser(req, res, next ){
    const targetId = req.params.userId;

    try {
        const user = await User
                        .findById(targetId)
                        .select('-__v -salt -hash')
                        .lean();
        return res.send({ data: user });
    } catch( error ){
        debug(error)
        return next( apiError.BadRequest() );
    }
}

module.exports = exports = entry;