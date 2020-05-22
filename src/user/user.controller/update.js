const User     = require('../user.model'),
      debug    = require('debug')('User'),
      ApiError = require('server-api-errors'); 

async function update(req, res, next) {
    
    const { telephone_no, vehicle_reg_no, email, old_pw, new_pw } = req.body;

    let user = req.userDoc;

    const updates = {};

    if ( old_pw && new_pw ){
        if( !user.validPassword(old_pw) )
            return next(ApiError.BadRequest('password wrong'));

        user.setPassword(new_pw);
        try{
            user.save();
            return res.send({ data:user  });
        }catch( error ){
            console.log(error);
            return next(ApiError.BadRequest());
        }
    }

    if (vehicle_reg_no)
        updates.vehicle_reg_no = vehicle_reg_no;

    if ( telephone_no )
        updates.telephone_no = telephone_no;

    if ( email )
        updates.data = {email: email};

    try {
        user = await User.findByIdAndUpdate(user._id, updates, {new: true});
        return res.send({ data:user  })
    } catch( error ){
        console.log(error);
        return next(ApiError.BadRequest());
    }

}

module.exports = exports = update;