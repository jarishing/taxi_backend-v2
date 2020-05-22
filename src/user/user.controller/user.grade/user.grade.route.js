const express = require('express'),
      userGradeContoller = require('./user.grade.controller'),
      router = express.Router(),
      auth = require('../../../utils/auth');

router.put('/:userId', auth.admin, userGradeContoller.set );

module.exports = router;