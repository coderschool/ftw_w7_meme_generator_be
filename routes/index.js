const express = require("express");
const router = express.Router();

// All route of Meme
const memeRoutes = require("./memeApi");
router.use("/memes", memeRoutes);

module.exports = router;
