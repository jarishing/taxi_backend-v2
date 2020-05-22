const express = require('express'),
      userCommentController = require('./user.comment.controller'),
      router = express.Router(),
      auth = require('../../../utils/auth.js');

router.get('/:userId', auth, userCommentController.get );

module.exports = router;