const User = require('../../../user.model'),
      AWS = require('aws-sdk'),
      debug = require('debug')('User'),
      apiError = require('server-api-errors');

AWS.config.update({
    "accessKeyId":"AKIAI54DQ77BPWGL5K5A",
    "secretAccessKey":"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",
    "region":"ap-southeast-1" 
})

async function pass( req, res, next ){
    try{
        const validUser = await User.findById(req.params.userId);

        if(!validUser)
            return next( apiError.BadRequest(errors.DocumentNotFound('User')));

        validUser.valid = true;
        await validUser.save();

        let message = {
            Message: `歡迎使用 打的，您的打的帳號已開通，現在可以隨時登入使用。`,
            PhoneNumber: `+852${validUser.telephone_no}`,
        }

        // await new AWS.SNS({apiVersion: '2010-03-31'}).publish(message).promise();
        
        return res.json({
            data: validUser
        })
    } catch( error ){
        debug(error)
        return next( apiError.InternalServerError() );
    }
};

module.exports = exports = pass;