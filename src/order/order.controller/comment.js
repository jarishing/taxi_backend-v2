"use strict";

const Order         = require('../order.model'),
      driverEvalute = require('../../utils/driverEvalute'),
      debug         = require('debug')('Order'),
      apiError      = require('server-api-errors'),
      errors        = require('../../errors');

async function comment( req, res, next ) {
    
    const { star, comment } = req.body;

    if ( star === undefined || comment === undefined )
        return next(apiError.BadRequest());

    let order = req.order;

    if ( order.status != 'confirmed' && order.status != 'accepted')
        return next(apiError.Forbidden());

    try {
        order = await order.comment(star, comment);
        driverEvalute( order.acceptBy, star );
        return res.json(order);
    } catch ( error ){
        console.error(error);
        return next(apiError.InternalServerError());
    }
}

module.exports = exports = comment;