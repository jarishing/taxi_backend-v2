const Order    = require('../order.model'),
      User     = require('../../user/user.model'),
      SocketModel = require('../../socket/socket.model'),
      debug    = require('debug')('Order'),
      apiError = require('server-api-errors'),
      withinRange = require('../../utils/withinRange'),
      errors   = require('../../errors');

async function getOrders( req, res, next ){

    let condition = {};
    switch(req.query.status){

        case 'confirmed':
        case 'accepted':
            condition.status = req.query.status;
            if ( req.user.type == 'user' )
                condition.orderBy = req.user._id;
            else if ( req.user.type == 'driver' )
                if( req.query.identity == 'orderer')
                    condition.orderBy = req.user._id;
                else
                    condition.acceptBy = req.user._id;
            else if ( req.user.type == 'admin' );
            else    
                return next( apiError.BadRequest());
            break;

        case 'commented':
            condition.status = req.query.status;
            if ( req.user.type == 'user' ){
                condition.orderBy = req.user._id;
                break;
            } else if ( req.user.type == 'admin' ){
                break;
            }else
                return next( apiError.BadRequest());
               
        case 'new':
            if( req.user.type == 'driver' ){
                return driverGetNewOrder( req, res, next );
                // position = await SocketModel.findOne({user: req.user._id});
                // position = position.position;
                // condition = { $and:[ { status: 'new' }, { orderBy: { $ne: req.user._id }}] };
            }else if( req.user.type == 'user' ){
                condition.orderBy = req.user._id;
                condition.status = 'new';
            }
            else if( req.user.type == 'admin' )
                condition.status = 'new';
            else
                return next( apiError.BadRequest());
            break;
        case 'canceled':
        case 'badOrder':
            condition.status = req.query.status;
            if( req.user.type == 'admin' )
                break;
            else
                return next( apiError.BadRequest());
        case 'all':
            if( req.user.type == 'admin' )
                break;
            else if ( req.user.type == 'user' ){
                condition = { $and:[ { status: { $ne: 'badOrder' } }, { status: { $ne: 'new' } }  ] };
                condition.$and.push( { orderBy: req.user._id } );
                break;
            }else if ( req.user.type == 'driver' ){
                condition = { $and:[ { status: { $ne: 'badOrder' } }, { status: { $ne: 'canceled' } } ,{ status: { $ne: 'new' } }  ] };
                if( req.query.identity == 'orderer')
                    // condition.$and.push( { orderBy: req.user._id } );
                    return driverMakeOrderList( req, res, next );
                else{
                    condition.$and.push( { acceptBy: req.user._id } );
                }
                break;
            }else
                return next( apiError.BadRequest());
        default:
            return next( apiError.BadRequest());
    };

    try {
        let orders = await Order
                                .find(condition)
                                .populate('orderBy acceptBy')
                                .sort({createdAt: -1})
                                .lean();

        return res.json({ data: orders, count: orders.length });
    } catch( error ){
        console.error(error)
        return next( apiError.InternalServerError() );
    };

};

async function driverMakeOrderList( req, res, next ){
    let condition = { $and:[ { status: { $ne: 'badOrder' } }, { orderBy: req.user._id } ] };

    try {
        let orders = await Order
                                .find(condition)
                                .populate('orderBy acceptBy')
                                .sort({createdAt: -1})
                                .limit(20)
                                .lean();

        return res.json({ data: orders, count: orders.length });
    } catch( error ){
        console.error(error)
        return next( apiError.InternalServerError() );
    };
}

async function driverGetNewOrder( req, res, next ){
    let socket = SocketModel.findOne({user: req.user._id});
        driver = User.findById( req.user._id );

    [ socket, driver ] = await Promise.all([ socket, driver ]);
    // console.log( socket );
    
    // const condition = { $and:[ { status: 'new' }, { orderBy: { $ne: req.user._id }}] };
    // const condition = { $and:[ { status: 'new' }] };
    const condition = { $or: [ 
                            { $and:[ { status: 'new' }] },
                            { $and:[ { status: 'new' }, { orderBy:  req.user._id }] }
                        ]};

    let time = new Date();

    // if( driver.superClass == false ){
    switch( driver.grade ){
        case 'S':
            condition.$or[0].$and.push( { createdAt: { $lte: time} } );
        case 'A':
            time.setSeconds(time.getSeconds()-5);
            condition.$or[0].$and.push( { createdAt: { $lte: time} } );
            break;
        case 'B':
            time.setSeconds(time.getSeconds()-5);
            condition.$or[0].$and.push( { createdAt: { $lte: time} } );
            break;
        case 'C':
            time.setSeconds(time.getSeconds()-5);
            // time.setSeconds(time.getSeconds()-30);
            condition.$or[0].$and.push( { createdAt: { $lte: time} } );
            break;
        case 'D':
            time.setSeconds(time.getSeconds()-10);
            // time.setMinutes(time.getMinutes()-1);
            condition.$or[0].$and.push( { createdAt: { $lte: time} } );
            break;
        case 'E':
            time.setSeconds(time.getSeconds()-20);
            // time.setMinutes(time.getMinutes()-2);
            condition.$or[0].$and.push( { createdAt: { $lte: time} } );
            break;
        default:
            return next( apiError.BadRequest( errors.ValidationError('Invalid page type', 'driver grade')));
    };
    // };

    try{
        let orders = await Order
                                    .find(condition)
                                    .populate('orderBy acceptBy')
                                    .sort({createdAt: 1})
                                    .limit(20)
                                    .lean();

        // if( socket ){
        //     orders = orders.filter( item =>
        //         withinRange( 
        //             {lat: item.start.lat, lng: item.start.lng },
        //             position, 3
        //         )
        //     );
        // };

        return res.json({ data: orders, count: orders.length });

    } catch( error ){
        console.error(error)
        return next( apiError.InternalServerError() );
    };

    // switch( driver.grade ){
    //     case 'A':
    //         return;
    //     case 'B':
    //         time.setSeconds(time.getSeconds()-10);
    //         condition.$and.push( { createdAt: { $lte: time} } );
    //         break;
    //     case 'C':
    //         time.setSeconds(time.getSeconds()-30);
    //         condition.$and.push( { createdAt: { $lte: time} } );
    //         break;
    //     case 'D':
    //         time.setMinutes(time.getMinutes()-1);
    //         condition.$and.push( { createdAt: { $lte: time} } );
    //         break;
    //     case 'E':
    //         time.setMinutes(time.getMinutes()-2);
    //         condition.$and.push( { createdAt: { $lte: time} } );
    //         break;
    //     default:
    //         return next( apiError.BadRequest( errors.ValidationError('Invalid page type', 'driver grade')));
    // };


}

module.exports = exports = getOrders;