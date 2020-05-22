"use strict";

const mongoose = require("mongoose"),
      Schema   = mongoose.Schema;

const orderSchema = new mongoose.Schema({

    orderId: { type: Number, required: true, unique: true },

    start: { type: Schema.Types.Mixed, required: true },
    end: { type: Schema.Types.Mixed, required: true },
    route: { type: Schema.Types.Mixed },
    // criteria: { type: Schema.Types.Mixed, required: true },

    criteria: {
        taxiType: { 
            type: String,
            enum: [ 'red', 'green', 'blue' ],
            required: true
        },
        passenger:{
            type: Number,
            required: true
        },
        tunnel:{
            type: String,
            enum: [ 'any', 'hungHomTunnel', 'eastTunnel', 'westTunnel' ],
            require: true
        },
        discount:{
            type: Number,
            require: true
        },
        cost: {
            type: Number,
            require: true
        },
        time: {
            type: Number,
            require: true
        },
        distance: {
            type: Number,
            require: true
        },
        return: {
            type: Boolean,
            require: true
        },
        fixedPrice: {
            type: Number,
            require: true
        },
        payment:{
            type: String,
            enum: [ 'any', 'cash', 'octopus', 'wechat', 'creditCard', 'alipay' ],
            require: true
        },
        otherPhone: {
            type: String
        },
        required: {
            type: String
        }
    },

    status: { 
        type: String, 
        default: 'new',
        enum: [ 'new', 'accepted', 'confirmed', 'canceled', 'commented', 'badOrder' ]
    },
    
    orderBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    acceptBy: { type: Schema.Types.ObjectId, ref: "User" },

    overtime: { type: Boolean, default: false },

    userComment : {
        star: Number,
        comment: String,
        time: Date
    }

}, { timestamps: true });

orderSchema.statics.create = function( orderDoc ){
    let doc = new this(orderDoc);
    return doc.save();
};

orderSchema.statics.get = function( conditions ){
    return this
                .find(conditions)
                .populate('orderBy acceptBy')
                .lean();
};

orderSchema.methods.comment = function( star, comment ){
    this.userComment = { star, comment, date: Date.now() };
    this.status = 'commented';
    return this.save();
};

const Order = mongoose.model("Order", orderSchema );

module.exports = Order;

/**
 * 
 * Update incomplete order into bad order when server restart
 * 
 */
Order.update({ status:'new'}, {status: 'badOrder'}, { multi: true }).exec();