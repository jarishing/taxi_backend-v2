"use strict";

const Analysis = require('../analysis.model'),
      Order = require('../../order/order.model'),
      debug    = require('debug')('Analysis'),
      apiError = require('server-api-errors'),
      district = require('../../constant/district'),
      errors   = require('../../errors'),
      moment   = require('moment');

// async function update ( req, res, next ) {
//     const location = district.district;
//     let startData = [],endData = [],discountData=[],timeData=[];
//     let distance = 0,cost = 0;

//     try{
//         let result = Order.find( { $or: [ { status: 'accepted' }, { status: 'commented' }  ] } ).lean();
//         let total = Order.find( { $or: [ { status: 'accepted' }, { status: 'commented' }  ] } ).countDocuments();

//         [ result, total ] = await Promise.all( [ result, total ]);

//         if( result.length > 0 ){
//             result.map( item => {

//                 //for time range
//                 let indexOfTimeData = timeData.findIndex( i => i.timeRange === moment(item.createdAt).format('HH') );
//                 if( indexOfTimeData > -1 ){
//                     timeData[indexOfTimeData].times = timeData[indexOfTimeData].times + 1;
//                 }else{
//                     timeData.push( { 
//                         timeRange: moment(item.createdAt).format('HH'), 
//                         times: 1,
//                         data:{
//                             startData: [],
//                             endData: [],
//                             discountData: []
//                         }
//                     });
//                 }

//                 indexOfTimeData = timeData.findIndex( i => i.timeRange === moment(item.createdAt).format('HH') );

//                 //for start Data
//                 if( item.start.offset ){
//                     item.start.offset.map( offsetItem => {
//                     let startOffsetIndex = location.indexOf( offsetItem );
//                     if( startOffsetIndex > -1 ){
//                         let indexOfStartData = startData.findIndex(i => i.district === offsetItem );
//                         if( indexOfStartData > -1 ){
//                                 startData[indexOfStartData].times = startData[indexOfStartData].times + 1;
//                         }else{
//                                 startData.push( { district: offsetItem, times: 1 } );
//                         }

//                         let indexOfStartDataInTime = timeData[indexOfTimeData].data.startData.findIndex(i => i.district === offsetItem );
//                         if( indexOfStartDataInTime > -1 ){
//                             timeData[indexOfTimeData].data.startData[indexOfStartDataInTime].times = timeData[indexOfTimeData].data.startData[indexOfStartDataInTime].times + 1;
//                         }else{
//                             timeData[indexOfTimeData].data.startData.push( { district: offsetItem, times: 1 } );
//                         }
//                     }
//                     });
//                 };

//                 //for end Data
//                 if( item.end.offset ){
//                     item.end.offset.map( offsetItem => {
//                     let endOffsetIndex = location.indexOf( offsetItem );
//                     if( endOffsetIndex > -1 ){
//                         let indexOfEndData = endData.findIndex(i => i.district === offsetItem );
//                         if( indexOfEndData > -1 ){
//                                 endData[indexOfEndData].times = endData[indexOfEndData].times + 1;
//                         }else{
//                                 endData.push( { district: offsetItem, times: 1 } );
//                         }

//                         let indexOfEndDataInTime = timeData[indexOfTimeData].data.endData.findIndex(i => i.district === offsetItem );
//                         if( indexOfEndDataInTime > -1 ){
//                             timeData[indexOfTimeData].data.endData[indexOfEndDataInTime].times = timeData[indexOfTimeData].data.endData[indexOfEndDataInTime].times + 1;
//                         }else{
//                             timeData[indexOfTimeData].data.endData.push( { district: offsetItem, times: 1 } );
//                         }
//                     }
//                     });
//                 };

//                 //for discount
//                 let indexOfDiscountData = discountData.findIndex(i => i.discount === item.criteria.discount );
//                 if( indexOfDiscountData > -1 ){
//                     discountData[indexOfDiscountData].times = discountData[indexOfDiscountData].times + 1;
//                 }else{
//                     discountData.push( { discount: item.criteria.discount, times: 1});
//                 };

//                 let indexOfDiscountDataInTime = timeData[indexOfTimeData].data.discountData.findIndex(i => i.discount === item.criteria.discount );
//                 if( indexOfDiscountDataInTime > -1 ){
//                     timeData[indexOfTimeData].data.discountData[indexOfDiscountDataInTime].times = timeData[indexOfTimeData].data.discountData[indexOfDiscountDataInTime].times + 1;
//                 }else{
//                     timeData[indexOfTimeData].data.discountData.push( { discount: item.criteria.discount, times: 1});
//                 }

//                 //for average distance
//                 distance = distance + item.criteria.distance;
//                 //for average cost
//                 cost = cost + parseInt(item.criteria.cost);
//             });

//             distance = distance / total;
//             cost = cost / total;

//             let analysis = await Analysis.create({
//                 startData: startData,
//                 endData: endData,
//                 discountData: discountData,
//                 timeData: timeData,
//                 averageDistance: distance,
//                 averageCost: cost
//             });
    
//             return res.send({ data: analysis });
//             // return res.send({ data: timeData });
//         }
//         return res.send( 'no data find' );
//     } catch( error ){
//         console.log(error);
//         return next( apiError.InternalServerError() );
//     };
// };

async function update () {
    const location = district.district;
    let startData = [],endData = [],discountData=[],timeData=[];
    let distance = 0,cost = 0;

    try{
        let result = Order.find( { $or: [ { status: 'accepted' }, { status: 'confirmed' }, { status: 'commented' }  ] } ).lean();
        let total = Order.find( { $or: [ { status: 'accepted' }, { status: 'confirmed' }, { status: 'commented' }  ] } ).countDocuments();

        [ result, total ] = await Promise.all( [ result, total ]);

        if( result.length > 0 ){
            result.map( item => {

                //for time range
                let indexOfTimeData = timeData.findIndex( i => i.timeRange === moment(item.createdAt).format('HH') );
                if( indexOfTimeData > -1 ){
                    timeData[indexOfTimeData].times = timeData[indexOfTimeData].times + 1;
                }else{
                    timeData.push( { 
                        timeRange: moment(item.createdAt).format('HH'), 
                        times: 1,
                        data:{
                            startData: [],
                            endData: [],
                            discountData: []
                        }
                    });
                }

                indexOfTimeData = timeData.findIndex( i => i.timeRange === moment(item.createdAt).format('HH') );

                //for start Data
                if( item.start.offset ){
                    item.start.offset.map( offsetItem => {
                    let startOffsetIndex = location.indexOf( offsetItem );
                    if( startOffsetIndex > -1 ){
                        let indexOfStartData = startData.findIndex(i => i.district === offsetItem );
                        if( indexOfStartData > -1 ){
                                startData[indexOfStartData].times = startData[indexOfStartData].times + 1;
                        }else{
                                startData.push( { district: offsetItem, times: 1 } );
                        }

                        let indexOfStartDataInTime = timeData[indexOfTimeData].data.startData.findIndex(i => i.district === offsetItem );
                        if( indexOfStartDataInTime > -1 ){
                            timeData[indexOfTimeData].data.startData[indexOfStartDataInTime].times = timeData[indexOfTimeData].data.startData[indexOfStartDataInTime].times + 1;
                        }else{
                            timeData[indexOfTimeData].data.startData.push( { district: offsetItem, times: 1 } );
                        }
                    }
                    });
                };

                //for end Data
                if( item.end.offset ){
                    item.end.offset.map( offsetItem => {
                    let endOffsetIndex = location.indexOf( offsetItem );
                    if( endOffsetIndex > -1 ){
                        let indexOfEndData = endData.findIndex(i => i.district === offsetItem );
                        if( indexOfEndData > -1 ){
                                endData[indexOfEndData].times = endData[indexOfEndData].times + 1;
                        }else{
                                endData.push( { district: offsetItem, times: 1 } );
                        }

                        let indexOfEndDataInTime = timeData[indexOfTimeData].data.endData.findIndex(i => i.district === offsetItem );
                        if( indexOfEndDataInTime > -1 ){
                            timeData[indexOfTimeData].data.endData[indexOfEndDataInTime].times = timeData[indexOfTimeData].data.endData[indexOfEndDataInTime].times + 1;
                        }else{
                            timeData[indexOfTimeData].data.endData.push( { district: offsetItem, times: 1 } );
                        }
                    }
                    });
                };

                //for discount
                let indexOfDiscountData = discountData.findIndex(i => i.discount === item.criteria.discount );
                if( indexOfDiscountData > -1 ){
                    discountData[indexOfDiscountData].times = discountData[indexOfDiscountData].times + 1;
                }else{
                    discountData.push( { discount: item.criteria.discount, times: 1});
                };

                let indexOfDiscountDataInTime = timeData[indexOfTimeData].data.discountData.findIndex(i => i.discount === item.criteria.discount );
                if( indexOfDiscountDataInTime > -1 ){
                    timeData[indexOfTimeData].data.discountData[indexOfDiscountDataInTime].times = timeData[indexOfTimeData].data.discountData[indexOfDiscountDataInTime].times + 1;
                }else{
                    timeData[indexOfTimeData].data.discountData.push( { discount: item.criteria.discount, times: 1});
                }

                //for average distance
                if( item.criteria.distance )
                    distance = distance + item.criteria.distance;
                //for average cost
                if( item.criteria.cost )
                    cost = cost + parseInt(item.criteria.cost);
            });

            distance = distance / total;
            cost = cost / total;

            let analysis = await Analysis.create({
                startData: startData,
                endData: endData,
                discountData: discountData,
                timeData: timeData,
                averageDistance: distance,
                averageCost: cost
            });
    
            return;
            // return res.send({ data: timeData });
        }

        return;
    } catch( error ){
        console.log(error);
        return next( apiError.InternalServerError() );
    };
};

module.exports = exports = update;

// console.log(startData);
    // console.log(endData);
    // console.log(discountData);
    // console.log(timeData);

    //only conclude ordering and finished order!!

    // try{
    //     let result = Order.find();
    //     let total = Order.find().countDocuments();

    //     [ result, total ] = await Promise.all( [ result, total ]);

    //     result.map( item => {
            // distance = distance + item.criteria.distance;
            // cost = cost + parseInt(item.criteria.cost);
    //     });

        // distance = distance / total;
        // cost = cost / total;
        
        // for( const item of location ){
        //     let startresult = Order.find( {'start.offset': item } ).countDocuments();
        //     let endresult = Order.find( {'end.offset': item} ).countDocuments();
        //     [ startresult, endresult ] = await Promise.all( [ startresult, endresult ]);
        //     if( startresult > 0)
        //         startData.push({ district: item, times: startresult});
        //     if( endresult > 0)
        //         endData.push({ district: item, times: endresult});
        // };

        // for( const item of discountType ){
        //     let discountResult = await Order.find( { 'criteria.discount': item } ).countDocuments();
        //     if( discountResult > 0 )
        //         discountData.push({ discount: item, times: discountResult });
        // }

        // for( const item of time ){
        //     let timeResult = await Order( { 'createdAt': { $gte : [ { "$hour" : "$createdAt" }, item ] } } );
        //     if( timeResult > 0 )
        //         timedata.push({ timeRange: item, times: timeResult });
        // };

        // console.log( timedata );

        // let analysis = await Analysis.create({
        //     startData: startData,
        //     endData: endData,
        //     discountData: discountData,
        //     averageDistance: distance,
        //     averageCost: cost
        // });

        // return res.send({ data: analysis });
    // } catch( error ){
    //     console.log(error);
    //     return next( apiError.InternalServerError() );
    // };