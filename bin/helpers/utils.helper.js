"use strict";
const utilsHelper = {};

utilsHelper.sendResponse = (res, status, success, data, errors, msg, token) => {
  const response = {};
  if (success) response.success = success;
  if (data) response.data = data;
  if (errors) response.errors = errors;
  if (msg) response.msg = msg;
  if (token) response.token = token;
  return res.status(status).json(response);
};

module.exports = utilsHelper;
