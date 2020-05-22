require('dotenv').config();
const debug = require('debug')('Mongo');

const mongoose = require("mongoose");
mongoose.Promise = require('bluebird');
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, autoReconnect:true  });

mongoose.connection
      .on("connecting", _ => debug("Connection to mongoDB"))
      .on("error", error => debug( error ))
      .on("connect", () => debug('Connected to mongoDB '))
      .on("disconnected", _ => {
            debug("Disconnected to mongoDB");
            mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, autoReconnect:true  });
      })
      .on("reconnected", _ => debug("Reconnected to mongoDB "));