"use strict";

// dependencies
const createPaceMaker = require("./lib/createPaceMaker");
const errorCodes = require("./lib/errorCodes");

module.exports = createPaceMaker;
module.exports.create = createPaceMaker;
module.exports.Errors = errorCodes;
