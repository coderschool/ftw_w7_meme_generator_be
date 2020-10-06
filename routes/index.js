const express = require("express");
const router = express.Router();

// All route of Meme
const memeAPI = require("./meme.api");
router.use("/memes", memeAPI);

module.exports = router;
