"use strict";

const Order    = require('../order.model'),
      debug    = require('debug')('Order'),
      apiError = require('server-api-errors'),
      errors   = require('../../errors');

 async function load( req, res, next, orderId ){
    try {
        let order = await Order.findById(orderId);
        if ( !order )
            return next( apiError.BadRequest());
        req.order = order;
        return next();
    } catch( error ){
        debug(error);
        return next( apiError.BadRequest() );
    };
};

module.exports = exports = load;