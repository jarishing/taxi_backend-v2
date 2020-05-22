const User = require('../user.model'),
      apiError = require('server-api-errors'),
      AWS = require('aws-sdk'),
      errors = require('../../errors'),
      debug = require('debug')('User'),
      login = require('./login.js');

AWS.config.update({
    "accessKeyId":"AKIAI54DQ77BPWGL5K5A",
    "secretAccessKey":"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",
    "region":"ap-southeast-1" 
})

const entry = ( req, res, next ) => {
    // console.log(req.body.type);
    switch( req.body.type ){
        case 'admin':
            return createAdmin(req, res, next);
        case 'driver':
            return createDriver(req, res, next);
        case 'user': 
            return createUser(req, res, next);
        default:
            return next( apiError.BadRequest( errors.MissingParameter("type")));
    }
};

let setupIsDone = false;

async function createAdmin(req, res, next){
    console.log( setupIsDone );
    if( setupIsDone )
        return next( apiError.BadRequest(errors.UserExists()));
    
    try{
        // let admin = new User({
        //     type        : 'admin',
        //     username    : 'admin',
        //     email       : 'admin@admin.com',
        //     valid       : true
        // });
        let admin = new User({
            type            : 'admin',
            username        : 'admin',
            telephone_no    : 'admin@admin.com',
            valid           : true
        });

        admin.setPassword('123456');
        admin = await admin.save();
        setupIsDone = true;
        return login(req, res, next );
    } catch( error ){
        debug(error);
        return next( apiError.InternalServerError());
    }
};

async function createDriver(req, res, next){
    
    const { type, username, telephone_no, password, vehicle_reg_no, taxi_driver_id_photo } = req.body;

    // console.log( type, username, email, telephone_no, password, vehicle_reg_no, taxi_driver_id_photo );
    const details = [];
    for ( const field of ['username', 'telephone_no', 'password', 'vehicle_reg_no', 'taxi_driver_id_photo'])
        if ( req.body[field] === undefined)
            details.push( errors.MissingParameter( field ));
        
    if ( details.length > 0 )
        return next( apiError.BadRequest(details));

    try {

        let driver = await User.findOne({ $and: [{ telephone_no: telephone_no}, { type: 'driver'}] });
        // let driver = await User.findOne({ telephone_no: telephone_no});
     
        if ( driver )
            return next( apiError.BadRequest(errors.UserExists()));

        driver = await User.create({ type, username, telephone_no, vehicle_reg_no, taxi_driver_id_photo  }, password );

        let message = {
            Message: `您好！打的 已經收到您的申請，我們會盡快處理您的申請。 `,
            PhoneNumber: `+852${telephone_no}`,
        }

        // await new AWS.SNS({apiVersion: '2010-03-31'}).publish(message).promise();
        // return login(req, res, next );
        return res.send({ data: driver });
    } catch( error ){   
        debug(error);
        return next( apiError.InternalServerError());
    };
    
};

async function createUser(req, res, next){

    const { type, username, email, telephone_no, password } = req.body;

    const details = [];
    for ( const field of ['username', 'telephone_no', 'password'])
        if ( req.body[field] === undefined)
            details.push( errors.MissingParameter( field ));

    if ( details.length > 0 )
        return next( apiError.BadRequest(details));

    try {

        let user = await User.findOne({ $and: [{ telephone_no: telephone_no}, { type: 'user'}] });
        // let user = await User.findOne({ telephone_no: telephone_no });

        if ( user )
            return next( apiError.BadRequest(errors.UserExists()));

        let valid = true;
        user = await User.create({ type, username, telephone_no, valid, data:{ email: email } }, password );
        // return login(req, res, next );
        return res.send({ data: user });
    } catch( error ){   
        debug(error);
        return next( apiError.InternalServerError());
    };

};

module.exports = exports = entry;