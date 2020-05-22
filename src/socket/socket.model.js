"use strict";

const mongoose = require("mongoose"),
      
      SocketIO = require('socket.io'),
      withinRange = require('../utils/withinRange'),
      debug = require('debug')('Socket'),
      jwt = require('jsonwebtoken'),
      Order = require('../order/order.model');

let socketIo;

const socketSchema = new mongoose.Schema({
    socketId: { type: String, required: true },
    user : { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type : String,
    position: { lat: Number, lng: Number },
}, { timestamps: true });

socketSchema.statics.connect = function( server ){

    const _this = this;

    socketIo = SocketIO.listen( server );

    socketIo.on('connection', async function( socket ){

        const socketId = socket.id;

        debug(socketId + ' has connected');
        
        let client = await _this.record(socketId);
        socket.emit('connection', client );

        socket.on('what_is_me', access_token => client.whatIsMe(access_token) );
        
        socket.on('renew_location', position => client.updateLocation(position) );

        socket.on('disconnect', _ => _this.drop(socketId))

    });
};

socketSchema.statics.broadCastUser = async function( event, message ){
    const users = await this.find({ type: 'user'}).lean();
    for ( const user of users )
        if ( socketIo.sockets.connected[user.socketId] )
            socketIo.sockets.connected[user.socketId].emit( event, message );
};

socketSchema.statics.broadCastDriver = async function( event, message ){
    const users = await this.find({ type: 'driver' }).lean();
    for ( const user of users )
        if ( socketIo.sockets.connected[user.socketId] )
            socketIo.sockets.connected[user.socketId].emit( event, message );
        else    
            debug("Driver not found");
};

socketSchema.statics.broadCastDriverByDistance = async function( position, distance, event, message ){
    const users = await this.find({ type: 'driver' }).lean();
    for ( const user of users )
        if ( withinRange( position, user.position, distance ))
            if ( socketIo.sockets.connected[user.socketId] )
                socketIo.sockets.connected[user.socketId].emit( event, message );
};

socketSchema.statics.record = async function( socketId ){
    let doc = new this({ socketId: socketId });
    doc = await doc.save();
    return doc;
};

socketSchema.methods.emitSocket = function( event, message ){
    if ( socketIo.sockets.connected[this.socketId] ){
        socketIo.sockets.connected[this.socketId].emit( event, message );
        console.log(`emit event ${event} with message ${message} with ${this.socketId}`);
    } else   
        console.log('User not found')
};

socketSchema.statics.drop = async function( socketId ){
    debug( socketId + ' has disconnected');

    const socket = await this.findOne({ socketId });
    
    if ( socket ){
        if( socket.type == "user" )
            await Order.update({ orderBy: socket._doc.user, status: 'new' }, { status:'badOrder' });
    }

    await this.find({ socketId }).remove().exec();

    this.broadCastDriver('action', 'NEW_ORDER');
};

socketSchema.methods.updateLocation = async function( position ){

    debug("UPDATE LOCATION")

    const updated = await Socket.findOneAndUpdate({ socketId: this.socketId }, { position: position }, { upsert: true, new: true }).exec();
    // debug(this);
};

socketSchema.methods.whatIsMe = async function( access_token ){

    debug("WHAT IS ME ");

    const doc = jwt.verify(access_token, process.env.SECRET_KEY);

    const updated = await Socket.findOneAndUpdate({ socketId: this.socketId }, { user: doc._id, type: doc.type }, { upsert: true, new: true }).exec();
    // console.log( updated );
    if( updated )
        updated.emitSocket('action', 'CONNECTION' );
    // debug(updated);
};

socketSchema.statics.emitListOfDriver = async function( DriverList, event, message ){
    // const users = await this.find({ type: 'driver' }).lean();
    // console.log( DriverList, event, message );
    if(DriverList.length == 0 )
        return;
    for ( const user of DriverList )
        if ( socketIo.sockets.connected[user.socketId] )
            socketIo.sockets.connected[user.socketId].emit( event, message );
        else    
            debug("Driver not found");
};


const Socket = mongoose.model( "Socket", socketSchema );

module.exports = exports = Socket;

exports.type = require('./socket.type');

Socket.find().remove().exec();

