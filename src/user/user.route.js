const express = require('express');
const userController = require('./user.controller');
const router = express.Router();
const auth = require('../utils/auth.js');

router.use('/order', require('./user.controller/user.order/user.order.route'));
router.use('/comment', require('./user.controller/user.comment/user.comment.route'));
router.use('/ban', require('./user.controller/user.ban/user.ban.route'));
// router.use('/superclass', require('./user.controller/user.superclass/user.superclass.route'));
router.use('/valid', require('./user.controller/user.valid/user.valid.route'));
router.use('/setgrade', require('./user.controller/user.grade/user.grade.route'));

router.route('/login')
    // login route
    .post( userController.login );

router.route('/forgetPassword')
    .post( userController.forget );

router.route('/')
    .get( userController.list )
    .post( userController.create );

router.route('/:userId')
    .get( auth, userController.get )
    .patch( auth, userController.update )
    .delete( auth.admin, userController.deleteAccount );

router.param('userId', userController.load );

module.exports = router;



// router.get('/:userId', auth, userController.get );


// router.patch('/:userId', auth, userController.update );