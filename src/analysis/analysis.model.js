"use strict";

const mongoose = require("mongoose"),
      Schema   = mongoose.Schema;

const analysisSchema = new mongoose.Schema({

    startData:{ type: Schema.Types.Mixed },
    endData:{ type: Schema.Types.Mixed },
    discountData:{ type: Schema.Types.Mixed },
    timeData:{ type: Schema.Types.Mixed },

    averageDistance: Number,
    averageCost: Number

}, { timestamps: true });

const Analysis = mongoose.model( "Analysis", analysisSchema );

module.exports = Analysis;

// Analysis.find().remove().exec();