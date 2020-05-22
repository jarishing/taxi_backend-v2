const express = require('express'),
      userBanController = require('./user.ban.controller'),
      router = express.Router(),
      auth = require('../../../utils/auth.js');

router.put('/release/:userId', auth.admin, userBanController.unban );

router.put('/:userId', auth.admin, userBanController.ban );

module.exports = router;