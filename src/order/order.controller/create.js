const Order    = require('../order.model'),
      Place    = require('../../place/place.model'),
      debug    = require('debug')('Order'),
      apiError = require('server-api-errors'),
      errors   = require('../../errors'),
      Google   = require('../../utils/googleService'),
      costCal  = require('../../utils/costCal'),
      { directSearch } = require('../../utils/googleService'),
      Socket   = require('../../socket/socket.model.js');

const entry = async( req, res, next ) => {
    switch( req.user.type ){
        case 'user':
            return createOrder( req, res, next );
        case 'driver':
            return driverCreateOrder( req, res, next );
        default:
            return next( apiError.BadRequest( errors.MissingParameter("type")));
    }
}

async function createOrder( req, res, next ){

    let { origin, destination, route, criteria } = req.body;
    let temp,originResult,destinationResult,routeResult;

    if( !route )
        route = null;

    try {
        // let data = costCal( origin, destination, route1, route2, route3, criteria.taxiType,  criteria.tunnel, criteria.discount );
        let data = costCal( origin, destination, route, null, null, criteria.taxiType,  criteria.tunnel, criteria.discount ),
            total = Order.find().countDocuments();
            // total = Order.findOne().sort({created_at: -1});

        originResult = Place.getAddress( origin.lat, origin.lng );
        destinationResult = Place.getAddress( destination.lat, destination.lng );

        if( route )
            routeResult = await Place.getAddress( route.lat, route.lng );

        [ data, total, originResult, destinationResult ] = await Promise.all([ data, total, originResult, destinationResult ]);

        if( originResult == false){
            originResult = {
                "address": "起始點",
                "lat": origin.lat,
                "lng": origin.lng,
                "offset": []
            }
        }

        if( destinationResult == false ){
            destinationResult = {
                "address": "目的地",
                "lat": destination.lat,
                "lng": destination.lng,
                "offset": []
            }
        }

        if( routeResult == false ){
            routeResult = {
                "address": "中程經過",
                "lat": route.lat,
                "lng": route.lng,
                "offset": []
            }
        }

        if( criteria.return )
            data.cost = data.cost*2;

        criteria['cost'] = data.cost;
        criteria['time'] = data.time;
        criteria['distance'] = data.distance;

        let order = await Order.create({
            orderId  : 10000 + total,
            start    : originResult,
            end      : destinationResult,
            route    : routeResult,
            criteria : criteria,
            orderBy  : req.user._id  
        });

        // Socket.broadCastDriver('action', Socket.type.NEW_ORDER );

        // broadcastWithGrade( );

        return res.send({ data: order });
    } catch( error ){
        console.error(error)
        return next( apiError.InternalServerError() );
    };

};

async function driverCreateOrder( req, res, next ){
    let { origin, destination, route, criteria } = req.body;
    let data;

    originData = directSearch( origin );
    // origin = directSearch( "xszxaxascas" );
    destinationData = directSearch( destination );

    let total = Order.find().countDocuments();

    [ originData, destinationData, total ] = await Promise.all([ originData, destinationData, total ]);

    if( route ){
        routeData = await directSearch( route);
        if( routeData.length == 0 )
            routeData = null;
    }else
        routeData = null;

    try {
        if( originData.length != 0 && destinationData.length != 0 && route && routeData )
            data = await costCal( originData, destinationData, routeData, null, null, criteria.taxiType,  criteria.tunnel, criteria.discount );
        else
            data = { cost: null, time: null, distance: null };
        
        if( originData.length == 0 ){
            originData = {
                address: origin,
                lat: null,
                lng: null,
                offset:[]
            }
        }

        if( destinationData.length == 0 ){
            destinationData = {
                address: destination,
                lat: null,
                lng: null,
                offset:[]
            }
        }

        if( route && !routeData ){
            routeData = {
                address: route,
                lat: null,
                lng: null,
                offset:[]
            }
        }

        criteria['cost'] = data.cost;
        criteria['time'] = data.time;
        criteria['distance'] = data.distance;

        let order = await Order.create({
            orderId  : 10000 + total,
            start    : originData,
            end      : destinationData,
            route    : routeData,
            criteria : criteria,
            orderBy  : req.user._id  
        });

        // Socket.broadCastDriver('action', Socket.type.NEW_ORDER );

        // broadcastWithGrade( );

        console.log("-----------checking-----------")
        console.log(order.criteria);
        return res.send({ data: order });
    } catch( error ){
        console.error(error)
        return next( apiError.InternalServerError() );
    };
}

module.exports = exports = entry;


// if( origin.length == 0 || destination == 0 )
// return next( apiError.BadRequest( errors.ValidationError("Address can not find")));

// if( route ){
// route = await directSearch( route);
// if( route.length == 0 )
//     return next( apiError.BadRequest( errors.ValidationError("Address can not find")));
// }else
// route = null;

// if( )

// if( originData.length == 0 ){
    // originData = {
    //     address: origin,
    //     lat: null,
    //     lng: null,
    //     offset:[]
    // }
// }

// if( destinationData.length == 0 ){
    // destinationData = {
    //     address: destination,
    //     lat: null,
    //     lng: null,
    //     offset:[]
    // }
// }

// if( route ){
//     routeData = await directSearch( route);
//     if( routeData.length == 0 ){
//         routeData = {
//             address: route,
//             lat: null,
//             lng: null,
//             offset:[]
//         }
//     }
// }else
//     routeData = null;

// { address: '香港太子東海大廈',
//   lat: 22.32338,
//   lng: 114.168784,
//   offset: [ '東海大廈', '太子', '香港' ] }



    // if( criteria.taxiType != "red" && criteria.taxiType != "green")
    //     return next( apiError.BadRequest( errors.ValidationError("Taxi Type should be red or green", 'taxiType')));

    // if( criteria.passenger != 4 && criteria.passenger != 5 && criteria.passenger != 6 && criteria.passenger != 7)
    //     return next( apiError.BadRequest( errors.ValidationError("Invalid passenger number", 'passenger')));

    // if( criteria.tunnel != "any" && criteria.tunnel != "HungHomTunnel" && criteria.tunnel != "eastTunnel" && criteria.tunnel != "westTunnel" )
    //     return next( apiError.BadRequest( errors.ValidationError("Invalid tunnel type", 'tunnel')));

    // if( criteria.discount !== 85 && criteria.discount !== 90 && criteria.discount !== 100 )
    //     return next( apiError.BadRequest( errors.ValidationError("Invalid discount type", 'discount')));

    // if( criteria.taxiType != "red" && criteria.taxiType != "green")
    //     return next( apiError.BadRequest( errors.ValidationError("Taxi Type should be red or green", 'taxiType')));
    
    // if( criteria.passenger != 4 && criteria.passenger != 5)
    //     return next( apiError.BadRequest( errors.ValidationError("Invalid passenger number", 'passenger')));

    // if( criteria.tunnel != "any" && criteria.tunnel != "HungHomTunnel" && criteria.tunnel != "eastTunnel" && criteria.tunnel != "westTunnel" )
    //     return next( apiError.BadRequest( errors.ValidationError("Invalid tunnel type", 'tunnel')));
    
    // if( criteria.discount !== 85 && criteria.discount !== 90 && criteria.discount !== 100 )
    //     return next( apiError.BadRequest( errors.ValidationError("Invalid discount type", 'discount')));

    // switch( criteria.routeStop ){
    //     case 0:
    //         break;
    //     case 1:
    //         if(!route.route1)
    //             return next( apiError.BadRequest() );
    //         route.route1 = await Place.getAddress( route.route1.lat, route.route1.lng );
    //         break;
    //     case 2:
    //         if(!route.route1)
    //             return next( apiError.BadRequest() );
    //         if(!route.route2)
    //             return next( apiError.BadRequest() );
    //         [ route.route1, route.route2 ] = await Promise.all([ Place.getAddress( route.route1.lat, route.route1.lng ), Place.getAddress( route.route2.lat, route.route2.lng ) ]);
    //         break;
    //     case 3:
    //         if(!route.route1)
    //             return next( apiError.BadRequest() );
    //         if(!route.route2)
    //             return next( apiError.BadRequest() );
    //         if(!route.route3)
    //             return next( apiError.BadRequest() );
    //         [ route.route1, route.route2, route.route3 ] = await Promise.all([ Place.getAddress( route.route1.lat, route.route1.lng ), Place.getAddress( route.route2.lat, route.route2.lng ), Place.getAddress( route.route3.lat, route.route3.lng ) ]);
    //         break;
    // };

    // let route1, route2, route3;

    // if( route ){
    //     route1 = route.route1? route.route1:null;
    //     route2 = route.route2? route.route2:null;
    //     route3 = route.route3? route.route3:null;
    // };



    // async function broadcastWithGrade(){
    //     let Driver = await Socket
    //                                 .find({ type: 'driver' })
    //                                 .populate('user');
    
    //     let AGradeDriver = Driver.filter( item => item.user.grade == 'A' ),
    //         BGradeDriver = Driver.filter( item => item.user.grade == 'B' ),
    //         CGradeDriver = Driver.filter( item => item.user.grade == 'C' ),
    //         DGradeDriver = Driver.filter( item => item.user.grade == 'D' ),
    //         EGradeDriver = Driver.filter( item => item.user.grade == 'E' );
    
    //     [ AGradeDriver, BGradeDriver, CGradeDriver, DGradeDriver, EGradeDriver ] = 
    //     await Promise.all([ AGradeDriver, BGradeDriver, CGradeDriver, DGradeDriver, EGradeDriver ]);
    
    //     // console.log(BGradeDriver, "============================" .CGradeDriver );
    //     Socket.emitListOfDriver(AGradeDriver, 'action', Socket.type.NEW_ORDER );
    //     broadcastDelay( BGradeDriver, 10000 );
    //     broadcastDelay( CGradeDriver, 30000 );
    //     broadcastDelay( DGradeDriver, 60000 );
    //     broadcastDelay( EGradeDriver, 120000 );
    // };
    
    // async function broadcastDelay( DriverList, delay ){
    //     // console.log("=================================");
    //     // console.log( DriverList, delay );
    //     setTimeout( function(){Socket.emitListOfDriver(DriverList, 'action', Socket.type.NEW_ORDER )} , delay);
    // };