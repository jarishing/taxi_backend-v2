const Google = require('./googleService'),
      isHKIsland = require('./isHKIsland');

async function costCal(origin, destination, route1, route2, route3, taxiType, tunnel, discount){

    let result = await Google.direction( origin, destination, route1, route2, route3, tunnel );

    let cost = 0, distance = 0, time = 0;

    result.forEach(item => {
        distance = distance + item.distance.value;
        time = time + item.duration.value;
    });

    let meter = distance;

    if( taxiType == "red" ){
        if( distance <= 2000 )
            cost = 24;
        else {
            distance = distance - 2000;
            distance = distance / 200;
            cost = 24 + distance * 1.7;
        };
        if( cost > 83.5 ){
            distance = distance - 35;
            cost = 83.5 + distance * 1.2;
        };
    };

    if( taxiType == "green" ){
        if( distance <= 2000 )
            cost = 20.5;
        else {
            distance = distance - 2000;
            distance = distance / 200;
            cost = 20.5 + distance * 1.5;
        };
        if( cost > 65.5 ){
            distance = distance - 30;
            cost = 65.5 + distance * 1.2;
        };
    };

    cost = cost * discount / 100;
    cost = cost.toFixed(1);

    return { cost: cost, time: time, distance: meter }
};

module.exports = exports = costCal;