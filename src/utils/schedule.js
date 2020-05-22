"use strict";

var schedule = require('node-schedule'),
    Order    = require('../order/order.model'),
    errors   = require('../errors'),
    Socket   = require('../socket/socket.model'),
    update   = require('../analysis/analysis.controller/update'),
    debug    = require('debug')('Order');

var emitOrderWithGrade = schedule.scheduleJob( '*/5 * * * * *', function(){
    Socket.broadCastDriver('action', 'RENEW_ORDER_LIST' );
});

var emitAnalysisData = schedule.scheduleJob( '*/5 * * * *', function(){
    update();
});

var delUnhandleOrder = schedule.scheduleJob( '*/5 * * * *',async function(){
    let time = new Date(),
        conditions = { $and:[ { status: 'accepted' }] };

    time.setMinutes( time.getHours() - 2);
    conditions.$and.push( { updatedAt: { $lte: time} } )

    try{
        let delableOvertimeOrder = await Order.find(conditions);

        delableOvertimeOrder = delableOvertimeOrder.map( item => new Promise( async resovle=>{

            const socket = await Socket.findOne({ user: item.orderBy });

            if(socket)
                socket.emitSocket('action', 'DRIVER_RELEASE' );

            const driverSocket = await Socket.findOne({ user: item.acceptBy });

            if(driverSocket)
                socket.emitSocket('action', 'USER_CANCEL' );
                
            item.status = 'badOrder';
            await item.save();
            return resovle(item);
            // return resovle(socket);
        }));

        delableOvertimeOrder = await Promise.all(delableOvertimeOrder);
    }catch( error ){
        console.log(error);
    }
});

var confirmOverTimeOrder = schedule.scheduleJob( '*/5 * * * * *',async function(){
    let time = new Date(),
        conditions = { $and:[ { status: 'new' }] };

    time.setMinutes( time.getMinutes() - 3);
    // time.setSeconds(time.getSeconds()-10);
    conditions.$and.push( { updatedAt: { $lte: time} } );

    try{
        let overtimeOrder = await Order.find(conditions);
        
        overtimeOrder = overtimeOrder.map( item => new Promise( async resovle=>{
            const socket = await Socket.findOne({ user: item.orderBy });
            // console.log(item);
            if(socket){
                socket.emitSocket('action', `ORDER_OVERTIME_CONFIRM-${item._id}` );
                item.overtime = true;
            }else{
                item.status = 'badOrder';
            }
            await item.save();
            return resovle(item);
            // return resovle(socket);
        }));

        overtimeOrder = await Promise.all(overtimeOrder);
    }catch( error ){
        console.log(error);
    }
});

var delOverTimeOrder = schedule.scheduleJob( '*/5 * * * * *',async function(){
    let time = new Date(),
        conditions = { $and:[ { overtime: true }, { status: 'new' }] };

    time.setMinutes( time.getMinutes() - 2);
    // time.setSeconds(time.getSeconds()-10);
    conditions.$and.push( { updatedAt: { $lte: time} } );

    try{
        let delableOvertimeOrder = await Order.find(conditions);

        delableOvertimeOrder = delableOvertimeOrder.map( item => new Promise( async resovle=>{

            const socket = await Socket.findOne({ user: item.orderBy });

            if(socket)
                socket.emitSocket('action', 'ORDER_OVERTIME_DEL' );
                
            item.status = 'badOrder';
            await item.save();
            return resovle(item);
            // return resovle(socket);
        }));

        delableOvertimeOrder = await Promise.all(delableOvertimeOrder);
    }catch( error ){
        console.log(error);
    }
});

module.exports = {
    emitOrderWithGrade,
    emitAnalysisData,
    delUnhandleOrder,
    confirmOverTimeOrder,
    delOverTimeOrder
};