require('./config.js');

const app = require('./app'),
      Schedule = require('./utils/schedule'),
      port = process.env.PORT || 3100;


// var schedule = require('node-schedule');

let server = app.listen( port , function (error) {
    if (error)
        return console.log("Some Error Cause", error);
    console.log( `Server has listen at PORT ${port}` );

    require('./socket/socket.model.js').connect( server );
});

// Schedule.emitOrderWithGrade;
// Schedule.delOvertimeOrder;

module.exports = server;