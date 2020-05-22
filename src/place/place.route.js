"use strict";

const express = require('express'),
      placeController = require('./place.controller'),
      placeCtrl = require('./place.ctrl'),
      router = express.Router();

router.route('/')
    .get( placeController.find );

router.get('/address',placeController.getLocationAddress );

router.post('/path', placeController.path );

router.post('/findNearby', placeCtrl.findNearby );
    
module.exports = router;