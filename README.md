# Meme Generator Server

## Introduction

An Express app for RESTFUL API.

## Implementation

### Setup project

- Create an express app using `express-generator`:
  ```bash
  mkdir meme-generator
  cd meme-generator
  mkdir server
  cd server
  npx express-generator --no-view
  npm install
  git init
  ```
- Install `nodemon` to keep tracking your changes and automatically restart server:
  ```bash
  npm install --save-dev nodemon
  ```
  Open `package.json`, add `"dev": "nodemon ./bin/www"` to `"scripts: {..}"`
- Install dependencies:
  ```bash
  npm i dotenv
  npm i cors
  ```
- Remove everything in `public/`
- Create `\.env`:
  ```
  PORT=5000
  ```
  Install `dotenv`: `npm i dotenv`. Then add `require("dotenv").config();` in `/bin/wwww`:
  ```javascript
  require("dotenv").config();
  var app = require("../app");
  var debug = require("debug")("server:server");
  ```
- Create `\.gitignore`:
  ```
  node_modules/
  .DS_Store
  .vscode/
  *lock.json
  build
  .env
  config/
  ```
- In `/routes/index.js`, replace `res.render('index', { title: 'Express' });` with
  ```javascript
  res.send({status:'ok', data:"Hello World!"});
  ```
- Test the app: `npm run dev`, then open `localhost:5000` on the browser.
- Commit git for the first time.

### Project structure

- 

### Setup `app.js`

- Create `/helpers/utilsHelper.js`:
  ```javascript
  "use strict";
  const utilsHelper = {};
  
  // This function controls the way we response to the client
  // If we need to change the way to response later on, we only need to handle it here
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
  ```
  In `app.js`, add: `const utilHelper = require("./helpers/utils.helper");`
- In `routes/`, delete `users.js`. In `app.js`,remove
  ```diff
  -const usersRouter = require("./routes/users");
  ...
  -app.use("/users", usersRouter);
  ```
- Create `routes/memeApi.js`:
  ```javascript
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
  ```
- In `routes/index.js`, replace everything with:
  ```javascript
  const express = require("express");
  const router = express.Router();

  // All route of Meme
  const memeRoutes = require("./memeApi.js");
  router.use("/memes", memeRoutes);

  module.exports = router;
  ```
  In `app.js`, change `app.use("/", indexRouter);` to `app.use("/api", indexRouter);`
- Import `cors`:
  ```diff
  +const cors = require("cors")
  ...
  app.use(cookieParser());
  +app.use(cors());
  ```
- Test `localhost:5000\api\memes`, `localhost:5000\whatever`

### Setup Postman collection for testing

- Open Postman, click `New Collection` -> Name: `Meme Generator`, Description (optional) -> Open tab `Variables` -> Variable: url, Initial Value: `http://localhost:5000` -> Create
- Hover the mouse on `Meme Generator` on the side menu, click `...` (View more actions) -> Add Request -> Name: Get all memes -> Save
- Click on the new Request -> `{{url}}/api/memes` -> Send -> Save
- Create another GET Request to test Not Found:
  - Name: Get Not Found URL
  - URL: `{{url}}/not_found`
- Later on you will have a bunch of requests like these. Let's quickly write some [test scripts](https://learning.postman.com/docs/writing-scripts/test-scripts/) so that we can test all URLs at once:
  - Click on `Get all memes` -> Open tab `Tests`:
  ```javascript
  pm.test("Status test", function () {
    pm.response.to.have.status(200);
  });
  ```
  - Click on `Get Not Found URL` -> Open tab `Tests`:
  ```javascript
  pm.test("Status test", function () {
    pm.response.to.have.status(404);
  });
  ```
  - Remember to save the requests
  - Hover the mouse on `Meme Generator` on the side menu, click the "Play" icon -> Click `Run` -> Click `Run Meme Generator`
  - You should see that we pass all the `Status test`

