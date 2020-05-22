const User          = require('../user.model'),
      AWS           = require('aws-sdk'),
      uuid          = require('uuid/v1'),
      apiError      = require('server-api-errors'); 

AWS.config.update({
    "accessKeyId":"AKIAI54DQ77BPWGL5K5A",
    "secretAccessKey":"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",
    "region":"ap-southeast-1" 
})

async function forgetPw ( req, res, next ){
    const { telephone_no, username, type } = req.body;
    
    if( !telephone_no || !username || !type )
        return next( apiError.BadRequest('plz fill all the data'));

    let condiiton = { $and: [{ telephone_no: telephone_no}, { type: type}, { username: username }] };

    let user = await User.findOne( condiiton );

    if( !user )
        return next( apiError.BadRequest('user not find'));

    try{            
        let id = uuid();
        id = id.substring(0,8);

        user.setPassword(id);
        user.save();

        let message = {
            Message: `你的密碼已經更新, 新的密碼為 ${id} ,請登入後更改密碼`,
            PhoneNumber: `+852${user.telephone_no}`,
        }

        // let result = await new AWS.SNS({apiVersion: '2010-03-31'}).publish(message).promise();

        // console.log("-------------------");
        // console.log(user.telephone_no);
        // console.log(result);
        return res.send({user:user});
        
    } catch( error ){ 
        console.log(error);
        return next( apiError.InternalServerError());
    };

}

module.exports = exports = forgetPw;