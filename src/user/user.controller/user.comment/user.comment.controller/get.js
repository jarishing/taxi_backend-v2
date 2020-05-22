const Order    = require('../../../../order/order.model'),
      apiError = require('server-api-errors'),
      errors   = require('../../../../errors'),
      debug    = require('debug')('Order');

const entry = async( req, res, next ) => {
    
    switch( req.user.type ){
        case 'admin':
            return admin( req, res, next );
        case 'user':
            return user( req, res, next );
        default:
            return next( apiError.BadRequest( errors.ValidationError('Invalid user type', 'type')));
    };

};

async function admin( req, res, next ){
    let data = [];
    const conditions = { $and:[ { $or:[ { orderBy: req.params.userId }, { acceptBy: req.params.userId } ] } , { status: 'commented' } ] };

    try{
        const orders = await Order
                                .find(conditions)
                                .populate('orderBy')
                                .lean();

        if(orders.length > 0){
            orders.map( item => {
                data.push({ 
                    comment: item.userComment,
                    orderId: item._id,
                    orderBy: item.orderBy.username
                });
            });
        };

        return res.json({
            data: data,
            count: orders.length
        });
    } catch( error ){
        debug(error)
        return next( apiError.InternalServerError() );
    };
};

async function user( req, res, next ){
    let data = [];
    const conditions = { $and:[ { orderBy: req.user._id } , { status: 'commented' } ] };

    try{
        const orders = await Order.find(conditions).lean();

        if(orders.length > 0){
            orders.map( item => {
                data.push( item.userComment );
            });
        };

        return res.json({
            data: data,
            count: orders.length
        });
    } catch( error ){
        debug(error)
        return next( apiError.InternalServerError() );
    };
};

module.exports = exports = entry;