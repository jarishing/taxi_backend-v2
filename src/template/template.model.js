const mongoose = require("mongoose");

const templateSchema = new mongoose.Schema({

}, { timestamps: true });

const Template = module.exports = mongoose.model("template", templateSchema);
