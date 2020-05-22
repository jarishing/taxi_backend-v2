const analysisController = require('./analysis.controller'),
      express = require('express'),
      auth = require('../utils/auth'),
      router = express.Router();

router.route('/')
    .get( auth.admin, analysisController.get );

//testing
// router.route('/update')
//     .get( analysisController.update );

module.exports = router;