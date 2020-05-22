"use strict";

const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema({
    keyword : { type: String, required: true, unique: true },
    result  : { type: Object }
}, { timestamps: true });

placeSchema.statics.getAddress = async function( lat, lng ){

    let locationList = await this.findOne({ 'result.location.lat': lat, 'result.location.lng': lng });
    let address,offset;

    if( locationList ){
        locationList.result.forEach( (item) => {
            if( item.location.lat == lat && item.location.lng == lng ){
                address = item.address;
                offset = item.offset;
            }
        });
    
        address = address? address: locationList.result[0].address;
        offset = offset? offset: locationList.result[0].offset;
    
        return { address: address, lat: lat, lng: lng, offset: offset };
    }else{
        return false;
    }
};

const Place = mongoose.model( "Place", placeSchema );

module.exports = Place;