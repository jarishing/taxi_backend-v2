"use strict";

const User = require('../user/user.model'),
      apiError = require('server-api-errors'),
      debug = require('debug')('User');

const driverEvaluate = async( driverId, star ) => {
    let targetDriver = await User.findById(driverId);

    if(!targetDriver)
        return console.log( 'driver is not found');

    if(targetDriver.type !== 'driver')
        return console.log( 'it is not driver');

    switch( star ){
        case 0:
            targetDriver.mark = targetDriver.mark - 5;
            if( targetDriver.mark < 0)
                targetDriver.mark = 0;
            targetDriver.grade = await driverGrade( targetDriver.mark );
            break;
        case 1:
            targetDriver.mark = targetDriver.mark - 3;
            if( targetDriver.mark < 0)
                targetDriver.mark = 0;
            targetDriver.grade = await driverGrade( targetDriver.mark );
            break;
        case 2:
            targetDriver.mark = targetDriver.mark - 1;
            if( targetDriver.mark < 0)
                targetDriver.mark = 0;
            targetDriver.grade = await driverGrade( targetDriver.mark );
            break;
        case 4:
            targetDriver.mark = targetDriver.mark + 3;
            if( targetDriver.mark > 100)
                targetDriver.mark = 100;
            targetDriver.grade = await driverGrade( targetDriver.mark );
            break;
        case 5:
            targetDriver.mark = targetDriver.mark + 5;
            if( targetDriver.mark > 100)
                targetDriver.mark = 100;
            targetDriver.grade = await driverGrade( targetDriver.mark );
            break;
        default:
            break;
    }
    return await targetDriver.save();
};

const driverGrade = async( mark ) => {
    if( mark <= 20)
        return "E";
    else if( mark > 20 && mark <= 40 )
        return "D";
    else if( mark > 40 && mark <= 60 )
        return "C";
    else if( mark > 60 && mark <= 80 )
        return "B";
    else if( mark > 80 )
        return "A";
    else
        return console.log("driverGrade error ");
};


module.exports = exports = driverEvaluate;