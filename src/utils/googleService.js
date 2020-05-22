"use strict";

const isHKIsland = require('./isHKIsland');

const googleMapsClient = require('@google/maps').createClient({
    key: process.env.GOOGLE_API_KEY,
    Promise: require('bluebird')
});

const searchNearBy = async ( lat, lng ) => {

    let result = await googleMapsClient.placesNearby({
                            language: 'zh-TW',
                            location: [lat, lng],
                            radius: 1000,
                            rankby: 'prominence',
                            type: 'point_of_interest'
                        })
                        .asPromise();

    result = result.json.results;

    let data = [];

    result = result.map( item => {
        // item.name = item.name;
        // item.formatted_address = item.vicinity;

        data.push({
            name: item.name,
            formatted_address: item.vicinity,
            location: item.geometry.location
        })
    });
    return data;
    // return result;
};

const reverseGeocode = async ( lat, lng ) =>{
    let result = await googleMapsClient.reverseGeocode({
                    language: 'zh-TW', latlng: [lat, lng]
                })
                    .asPromise();

    result = result.json.results;
    return result;
};

const autocomplete = async ( keyword ) => {
    let result = await googleMapsClient.placesQueryAutoComplete(
                    {
                        input: `香港,${keyword}`,
                        language: 'zh-TW'
                    }).asPromise();
    
                    
    result = result.json.predictions;

    result = result.filter( item => item.place_id );

    console.log(JSON.stringify(result, null, 4));
                
    result = result.map( item => new Promise( async resolve => {
        let location = await placeIdToLatLng( item.place_id);
        item['geometry'] = {location};
        item['name'] = item.structured_formatting.main_text;
        item['formatted_address'] = item.structured_formatting.secondary_text;
        return resolve( item );
    }));

    result = await Promise.all( result );
    return result;
};

const directSearch = async ( keyword ) => {
    let result = await googleMapsClient.places({
                        query: keyword,
                        language: 'zh-TW'
                    }).asPromise();

    result = result.json.results;

    if(result.length > 0){
        result = {
            address: keyword,
            lat: result[0].geometry.location.lat,
            lng: result[0].geometry.location.lng,
            offset: []
        }
    };

    return result;
};

const placeIdToLatLng = async ( placeId ) => {

    let result = await googleMapsClient.reverseGeocode({ place_id: placeId }).asPromise();
    result = result.json.results[0].geometry.location;    

    return result;
};

const direction = async( origin, destination, route1, route2, route3, tunnel ) => {
    let waypoints = [];

    let originIsHKIsland = await isHKIsland( origin.lat, origin.lng);
    let destinationIsHKIsland = await isHKIsland( destination.lat, destination.lng);

    route1?
        waypoints.push([route1.lat, route1.lng]):null;
    route2?
        waypoints.push([route2.lat, route2.lng]):null;
    route3?
        waypoints.push([route3.lat, route3.lng]):null;

    if( originIsHKIsland != destinationIsHKIsland ){
        switch( tunnel ){
            case 'HungHomTunnel':
                if( originIsHKIsland == true){
                    console.log("hk to kowloon");
                    waypoints.push([22.291016, 114.182070]);
                }else{
                    console.log("kowloon to hk");}
                    waypoints.push([22.291801, 114.182036]);
                break;
            case 'eastTunnel':
                if( originIsHKIsland == true){
                    console.log("hk to kowloon");
                    waypoints.push([22.295262, 114.222841]);
                }else{
                    console.log("kowloon to hk");}
                    waypoints.push([22.295457, 114.223478]);
                break;
            case 'westTunnel':
                if( originIsHKIsland == true){
                    console.log("hk to kowloon");
                    waypoints.push([22.293321, 114.149312]);
                }else{
                    console.log("kowloon to hk");}
                    waypoints.push([22.294109, 114.150250]);
                break;
            default:
                break;
        }
    };

    let result = await googleMapsClient.directions(
                    {
                        origin      : [ origin.lat , origin.lng ],
                        destination : [ destination.lat , destination.lng ],
                        waypoints   : waypoints,
                        mode        : 'driving',
                        language    : 'zh-TW',
                        optimize    : true
                    }).asPromise();

    result = result.json.routes[0].legs;
    return result;
};

const testing = async ( lat, lng ) => {

    let result = await googleMapsClient.placesNearby({
                            language: 'zh-TW',
                            location: [lat, lng],
                            radius: 100
                        })
                        .asPromise();

    result = result.json.results;

    result = result.map( item => 
        console.log( item )
    );

    result = result.map( item => 
        item.formatted_address = item.vicinity
    );
    return result;
};

module.exports = { 
    searchNearBy, 
    autocomplete, 
    directSearch, 
    reverseGeocode, 
    placeIdToLatLng, 
    direction,
    testing 
};