"use strict";

const Analysis = require('../analysis.model'),
      Order    = require('../../order/order.model'),
      SocketMd = require('../../socket/socket.model'),
      debug    = require('debug')('Analysis'),
      errors   = require('../../errors'),
      district = require('../../constant/district'),
      moment   = require('moment'),
      apiError = require('server-api-errors');

const entry = async( req, res, next ) => {
    switch( req.query.page ){
        case 'main':
            return main( req, res, next );
        case 'data':
            return data( req, res, next );
        case 'now':
            return now( req, res, next );
        default:
            return next( apiError.BadRequest( errors.ValidationError('Invalid page type', 'type')));
    };
};

async function now( req, res, next ){
    const location = district.district;
    let startData = [],endData = [],discountData=[],timeData=[];
    
    try{
        let result = Order.find({ status: 'new' }).lean();
        let total = Order.find( { status: 'new' }).countDocuments();

        [ result, total ] = await Promise.all( [ result, total ]);

        if( result.length == 0){
            const data = {
                start: {
                    startLabel: null,
                    startData: null
                },
                end: {
                    endLabel: null,
                    endData: null
                },
                discount: {
                    discountLabel: null,
                    discountData: null
                },
                time: {
                    timeLabel: null,
                    timeData: null
                }
            }
    
            return res.send({ data });
        };

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
        });

        let start = startData.sort(function (a, b) { return -( a.times - b.times); }).slice(0, 5),
            end = endData.sort(function (a, b) { return -( a.times - b.times); }).slice(0, 5),
            discount = discountData.sort(function (a, b) { return -( a.times - b.times); }),
            time = timeData.sort(function (a, b) { return -( a.times - b.times); }).slice(0, 5);
        
        let startNowLabel = [],
            startNowData = [],
            endNowLabel = [],
            endNowData = [],
            discountNowLabel = [],
            discountNowData = [],
            timeNowLabel = [],
            timeNowData = [];


        start = start.map( item => {
            startNowLabel.push( item.district );
            startNowData.push( item.times );
        });

        end = end.map( item => {
            endNowLabel.push( item.district );
            endNowData.push( item.times );
        });

        discount = discount.map( item => {
            discountNowLabel.push( item.discount );
            discountNowData.push( item.times );
        });

        time = time.map( item => {
            timeNowLabel.push( item.timeRange );
            timeNowData.push( item.times );
        });
        // }

        await Promise.all([ start, end, discount, time ]);

        const data = {
            start: {
                startLabel: startNowLabel,
                startData: startNowData
            },
            end: {
                endLabel: endNowLabel,
                endData: endNowData
            },
            discount: {
                discountLabel: discountNowLabel,
                discountData: discountNowData
            },
            time: {
                timeLabel: timeNowLabel,
                timeData: timeNowData
            }
        }

        return res.send({ data });

    }catch( error ){
        console.log(error);
        return next( apiError.InternalServerError() );
    };
};

async function main( req, res, next ){
    try{
        let activeUser = SocketMd.find( { type: 'user' } ).lean().countDocuments(),
            activeDriver = SocketMd.find( { type: 'driver' } ).lean().countDocuments(),
            ordering = Order.find( { status: 'new' } ).lean().countDocuments(),
            analysisData = Analysis.findOne().sort({createdAt: -1});
        
        [ activeUser, activeDriver, ordering, analysisData ] = await Promise.all([ activeUser, activeDriver, ordering, analysisData ]);

        let popularStart,popularEnd,popularTime;

        if( !analysisData ){
            popularStart = [];
            popularEnd = [];
            popularTime = [];
        }else{
            popularStart = analysisData.startData.sort(function (a, b) { return -( a.times - b.times); }),
            popularEnd = analysisData.endData.sort(function (a, b) { return -( a.times - b.times); }),
            popularTime = analysisData.timeData.sort(function (a, b) { return -( a.times - b.times); });
        }
            
        let simpleAnalysisData = {
            mostPopularStart: popularStart[0]? popularStart[0]:null,
            mostPopularEnd: popularEnd[0]? popularEnd[0]:null,
            averageDistance: analysisData? analysisData.averageDistance:null,
            mostPopularTime: popularTime[0]? popularTime[0]:null
        }

        const data = {
            activeUser: activeUser,
            activeDriver: activeDriver,
            ordering: ordering,
            analysisData: simpleAnalysisData
        };

        return res.send({ data: data });
    } catch( error ){
        console.log( error );
        return next( apiError.InternalServerError() );
    };
}

async function data( req, res, next ) {
    try{
        let result = await Analysis.findOne().sort({createdAt: -1});
        if( !result ){
            const data = {
                start: {
                    startLabel: null,
                    startData: null
                },
                end: {
                    endLabel: null,
                    endData: null
                },
                discount: {
                    discountLabel: null,
                    discountData: null
                },
                time: {
                    timeLabel: null,
                    timeData: null
                }
            }
    
            return res.send({ data });
        }
            

        let start = result.startData.sort(function (a, b) { return -( a.times - b.times); }).slice(0, 5),
            end = result.endData.sort(function (a, b) { return -( a.times - b.times); }).slice(0, 5),
            discount = result.discountData.sort(function (a, b) { return -( a.times - b.times); }),
            time = result.timeData.sort(function (a, b) { return -( a.times - b.times); }).slice(0, 5);

        let startLabel = [],
            startData = [],
            endLabel = [],
            endData = [],
            discountLabel = [],
            discountData = [],
            timeLabel = [],
            timeData = [];

        // console.log("==============");
        // console.log( time );
        // console.log(req.query.timeRange);

        if( req.query.timeRange ){
            //have timerange filter
            let indexOfTimeRamge = time.findIndex(i => i.timeRange === req.query.timeRange);

            if( indexOfTimeRamge > -1 ){
                // console.log( time[indexOfTimeRamge].data.startData );
                start = time[indexOfTimeRamge].data.startData.sort(function (a, b) { return -( a.times - b.times); }).slice(0, 5);
                end = time[indexOfTimeRamge].data.endData.sort(function (a, b) { return -( a.times - b.times); }).slice(0, 5);
                discount = time[indexOfTimeRamge].data.discountData.sort(function (a, b) { return -( a.times - b.times); });
            }else{
                const data = {
                    start: {
                        startLabel: startLabel,
                        startData: startData
                    },
                    end: {
                        endLabel: endLabel,
                        endData: endData
                    },
                    discount: {
                        discountLabel: discountLabel,
                        discountData: discountData
                    },
                    time: {
                        timeLabel: timeLabel,
                        timeData: timeData
                    }
                }
        
                return res.send({ data });
            }
        }
        // }else{

        //no timeRange fiter 
        start = start.map( item => {
            startLabel.push( item.district );
            startData.push( item.times );
        });

        end = end.map( item => {
            endLabel.push( item.district );
            endData.push( item.times );
        });

        discount = discount.map( item => {
            discountLabel.push( item.discount );
            discountData.push( item.times );
        });

        time = time.map( item => {
            timeLabel.push( item.timeRange );
            timeData.push( item.times );
        });
        // }

        await Promise.all([ start, end, discount, time ]);

        const data = {
            start: {
                startLabel: startLabel,
                startData: startData
            },
            end: {
                endLabel: endLabel,
                endData: endData
            },
            discount: {
                discountLabel: discountLabel,
                discountData: discountData
            },
            time: {
                timeLabel: timeLabel,
                timeData: timeData
            }
        }

        return res.send({ data });
    } catch( error ){
        console.log( error );
        return next( apiError.InternalServerError() );
    };
};

module.exports = exports = entry;