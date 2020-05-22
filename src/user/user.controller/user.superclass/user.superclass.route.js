const express = require('express'),
      userSuperclass = require('./user.superclass.controller'),
      router = express.Router(),
      auth = require('../../../utils/auth.js');

router.put('/release/:userId', auth.admin, userSuperclass.release );

router.put('/:userId', auth.admin, userSuperclass.set );

module.exports = router;