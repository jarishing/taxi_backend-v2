const template = require('./template.controller'),
      express = require('express'),
      jwt = require("express-jwt"),
      auth = jwt({ secret: process.env.SECRET_KEY }),
      router = express.Router();

router.route('/')
    .get( auth, template.get )
    .post( auth, template.create );

router.route('/:templateId')
    .get( auth, template.getById )
    .post( auth, template.update )
    .delete( auth, template.remove );

router.param('templateId', template.load );

module.exports = router;