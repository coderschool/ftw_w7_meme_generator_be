var express = require("express");
var router = express.Router();

/**
 * @route GET api/memes
 * @description Get all memes
 * @access Public
 */
router.get("/", function (req, res, next) {
  res.send({ status: "ok", data: "Get all memes" });
});

module.exports = router;