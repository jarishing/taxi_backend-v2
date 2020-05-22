const express = require('express'),
      userValidController = require('./user.valid.controller'),
      router = express.Router(),
      auth = require('../../../utils/auth.js');

router.put('/:userId', auth.admin, userValidController.pass );

module.exports = router;