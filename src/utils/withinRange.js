"use strict";

const toRad = require('./toRad');

function withinRange( start, end, distance ){
    let radLat = toRad( start.lat ), radLng = toRad( start.lng ),
        radTargetLat = toRad( end.lat ), radTargetLng = toRad( end.lng );

    let latDiff = radLat - radTargetLat;
    let lngDiff = radLng - radTargetLng;
    let target_distance = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(latDiff/2),2) + Math.cos(radLat) * Math.cos(radTargetLat)*Math.pow(Math.sin(lngDiff/2),2)));
    
    target_distance = target_distance * 6378.137;
    target_distance = Math.round( target_distance * 10000 ) / 10000;

    return target_distance < distance;

};

module.exports = exports = withinRange;