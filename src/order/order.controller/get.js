"use strict";

const Order    = require('../order.model'),
      debug    = require('debug')('Order'),
      apiError = require('server-api-errors'),
      errors   = require('../../errors'),
      User     = require('../../user/user.model'),
      bluebird = require('bluebird'),
      Socket = require('../../socket/socket.model.js');

async function get( req, res, next ){

    let order = req.order._doc;

    const socket = await Socket
                            .findOne({ user: order.acceptBy })
                            .lean();

    if ( order.orderBy )
        order.orderBy = User.findById(order.orderBy);

    if ( order.acceptBy )
        order.acceptBy = User.findById(order.acceptBy);

    try {
        order = await bluebird.props( order );

        console.log(socket);

        if ( socket )
            order.criteria.driver_position = socket.position;

        return res.json({ data: order });
    } catch( error ){
        debug(error);
        return next( apiError.BadRequest() );
    };

};

module.exports = exports = get;