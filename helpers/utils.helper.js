"use strict";
const crypto = require("crypto");

const utilsHelper = {};

utilsHelper.sendResponse = (res, status, success, data, error, message) => {
  const response = {};
  if (success) response.success = success;
  if (data) response.data = data;
  if (error) response.error = { message: error.message };
  if (message) response.message = message;
  return res.status(status).json(response);
};

utilsHelper.generateRandomHexString = (len) => {
  return crypto
    .randomBytes(Math.ceil(len / 2))
    .toString("hex") // convert to hexadecimal format
    .slice(0, len)
    .toUpperCase(); // return required number of characters
};

module.exports = utilsHelper;
