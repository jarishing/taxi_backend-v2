"use strict";

const Place    = require('./place.model'),
      debug    = require('debug')('Place'),
      apiError = require('server-api-errors'),
      errors   = require('../errors'),
      costCal  = require('../utils/costCal'),
      uuid     = require('uuid/v1'),
      Google   = require('../utils/googleService');

async function find( req, res, next ){
    const keyword = req.query.keyword;

    if ( keyword === undefined || keyword === "" )
        return next( new apiError.BadRequest( errors.MissingParameter("keyword")));

    let data = await Place.findOne({ keyword: keyword });

    if( data !== null )
        return res.send({ data: data.result });

    try{
        data = await Google.autocomplete( keyword );

        let result = [];

        for( const item of data){
            let offset = [];

            if(item.terms){
                item.terms.map( location =>(
                    offset.push(location.value)
                ));
            };
            let location = {
                address     : item.description,
                location    : item.geometry.location,
                placeId     : item.place_id,
                description : item.description,
                offset      : offset
            };
            result.push(location);
        };

        let newPlace = new Place({
            keyword : keyword,
            result  : result
        });

        newPlace = await newPlace.save();
        return res.json({ data: result });
    } catch( error ){
        console.error(error)
        return next( apiError.InternalServerError() );
    }

};

async function getLocationAddress( req, res, next ){
    const { lat, lng } = req.query;
    try{
        let result = await Google.reverseGeocode( lat, lng );

        let data = result.map( item => ({
            address     : item.formatted_address,
            location    : item.geometry.location,
            placeId     : item.place_id,
            description : item.formatted_address,
            offset      : []
        }));

        let newPlace = new Place({
            keyword : uuid(),
            result  : data
        });

        newPlace = await newPlace.save();
        return res.json({ data: data });

        // console.log(data);

        // let docs = data.map( item => ({
        //     keyword: item.address,
        //     result: [{
        //         address: item.address,
        //         location: item.location
        //     }]
        // }));
        
        // await Place.insertMany(docs);

        // return res.send( { data: docs} );
        // return res.send( { data, count: data.length } );
    } catch( error ){
        console.log(error);
        return next( new apiError.InternalServerError() );
    }
};

async function path ( req, res, next ){
    const { origin, destination, taxiType, discount = 100, route, tunnel = "any" } = req.body;

    if( !origin.lat || !origin.lng || !destination.lat || !destination.lng ){
        return next( new apiError.BadRequest() );}

    if( taxiType != "red" && taxiType != "green"){
        return next( new apiError.BadRequest( errors.MissingParameter('taxiType')) );}

    if( tunnel != "any" && tunnel != "HungHomTunnel" && tunnel != "eastTunnel" && tunnel != "westTunnel"){
        return next( new apiError.BadRequest( errors.MissingParameter('tunnel')) );}

    let route1, route2, route3;
    
    if( route ){
        route1 = route.route1? route.route1:null;
        route2 = route.route2? route.route2:null;
        route3 = route.route3? route.route3:null;
    }

    try{
        let data = await costCal( origin, destination, route1, route2, route3, taxiType, tunnel, discount );
        return res.send({ data });
    } catch( error ){
        console.log(error);
        return next( new apiError.InternalServerError() );
    }
};

module.exports = {
    find: find,
    path: path,
    getLocationAddress: getLocationAddress
};