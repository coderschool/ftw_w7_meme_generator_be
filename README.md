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
  npm i dotenv cors
  npm i multer jimp
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

```
|- bin/
|- controllers/
|- helpers/
|- middlewares/
|- models/
|- public/
|- routes/
|- app.js
```

### Setup `app.js`

- Create `/helpers/utilsHelper.js`:
  ```javascript
  "use strict";
  const utilsHelper = {};
  
  // This function controls the way we response to the client
  // If we need to change the way to response later on, we only need to handle it here
  utilsHelper.sendResponse = (res, status, success, data, error, message, token) => {
    const response = {};
    if (success) response.success = success;
    if (data) response.data = data;
    if (error) response.error = {message: error.message};
    if (message) response.message = message;
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
  const memeRoutes = require("./memeApi");
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
- Error Handling: In `app.js`, add
  ```javascript
  /* Initialize Routes */
  app.use("/api", indexRouter);

  // catch 404 and forard to error handler
  app.use((req, res, next) => {
    const err = new Error("Not Found");
    err.statusCode = 404;
    next(err);
  });

  /* Initialize Error Handling */
  app.use((err, req, res, next) => {
    if (err.statusCode === 404) {
      return utilsHelper.sendResponse(res, 404, false, null, err, null);
    } else {
      console.log("ERROR", err.message);
      return utilsHelper.sendResponse(res, 500, false, null, err, null);
    }
  });

  module.exports = app;
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

### User can create a meme

In this step we allow user to post an image and some texts to the server. The server will save the image in a folder, resize it if needed. Then to create a meme, the app will put the texts on the original image and save the meme as a new image. 

#### Task 1 - Write a middleware to save the uploaded image

- Create `/helpers/upload.helper.js`. This is a function that returns the `multer` middleware to save the image. The function takes in a folder path, create the folder if it's not exists, and use it as the storage.
  ```javascript
  const fileUploadHelper = (filePath) => {
  const multer = require("multer");
  const path = require("path");
  const mkdirp = require("mkdirp");

  const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
      const uploadPath = path.resolve(filePath);
      try {
        const folderStat = await ensureFolderExists(uploadPath);
        if (folderStat) {
          cb(null, uploadPath);
        } else {
          cb(null, "");
        }
      } catch (err) {
        cb(err);
      }
    },
    filename: function (req, file, cb) {
      const uniquePrefix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniquePrefix + "-" + file.originalname);
      },
    });
    const ensureFolderExists = (path) => {
      return new Promise((resolve, reject) => {
        mkdirp(path, (err) => {
          if (err) {
            reject(err); // something else went wrong
          } else {
            resolve(true); // successfully created folder
          }
        });
      });
    };
    return {
      uploader: multer({
        storage: storage,
        fileFilter: (req, file, cb) => {
          if (
            !file.mimetype.includes("jpeg") &&
            !file.mimetype.includes("jpg") &&
            !file.mimetype.includes("png")
          ) {
            return cb(null, false, new Error("Only images are allowed"));
          }
          cb(null, true);
        },
      }),
    };
  };
  module.exports = fileUploadHelper;
  ```
  - In `memeApi.js`:
  ```javascript
  const fileUpload = require("../helpers/upload.helper")("public/images/");
  const uploader = fileUpload.uploader;
  ...
  /**
  * @route POST api/memes
  * @description Create a new meme
  * @access Public
  */
  router.post("/", uploader.single("image"), (req, res, next) => {
    console.log(req.file);
    res.send({ status: "ok" });
  });
  ```
  - Open Postman, create a new POST Request to `{{url}}/api/memes` called `Create meme`. In the `body` tab, choose `form-data`, put `image` as type `file` AS `KEY`, and select a file as VALUE. Click `Send`.
  - You should see the `ok` response and find the image in `public/images`. The file object in `req` should look like this:
  ```
  {
    fieldname: 'image',
    originalname: 'C92D2327-7FF8-4445-8F5D-890EA780B6CB_1_201_a.jpeg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    destination: 'public/images/',
    filename: '1597210085549-957864468-C92D2327-7FF8-4445-8F5D-890EA780B6CB_1_201_a.jpeg',
    path: 'public/images/1597210085549-957864468-C92D2327-7FF8-4445-8F5D-890EA780B6CB_1_201_a.jpeg',
    size: 454050
  }
  ```

#### Task 2 - A middleware to resize the file

Let's continue to build another middleware to resize the uploaded image to have 400 pixel max width or heigth. We are using the libary Jimp.

- Create `helpers/photo.helper.js`:
  ```javascript
  const Jimp = require("jimp");
  const fs = require("fs");

  const photoHelper = {};

  photoHelper.resize = async (req, res, next) => {
    if (req.file) {
      try {
        req.file.destination =
          req.file.destination.split("\\").join("/").split("server/")[1] + "/";
        req.file.path = req.file.path.split("\\").join("/").split("server/")[1];
        Jimp.read(req.file.path, async (err, image) => {
          if (err) next(err);
          const img = await image.scaleToFit(400, 400).write(req.file.path);
          next();
        });
      } catch (err) {
        next(err);
      }
    } else {
      next(new Error("Image required"));
    }
  };

  module.exports = photoHelper;
  ```
- Then in `memeApi.js`: import `photoHelper` and add `photoHelper.resize` after `uploader`:
  ```javascript
  const photoHelper = require("../helpers/photo.helper");
  ...
  router.post(
    "/",
    uploader.single("image"),
    photoHelper.resize,
    (req, res, next) => {
      console.log(req.file);
      res.send({ status: "ok" });
    }
  );
  ```
- Test again with the Postman request `Create meme`
- You should see that the image that is saved in `public/images` is now resized.

#### Task 3 - Create the meme controller

In this simple app, we use a `json` file to store the info of memes. This should be avoid in production app, and you should use a database to store the data.

- Create `/memes.json`:
  ```json
  {
    "memes":[]
  }
  ```
- We use a library called `crypto` to generate the id for the memes. In `utilsHelper.js`, add:
  ```javascript
  const crypto = require("crypto");
  ...
  utilsHelper.generateRandomHexString = (len) => {
    return crypto
      .randomBytes(Math.ceil(len / 2))
      .toString("hex") // convert to hexadecimal format
      .slice(0, len)
      .toUpperCase(); // return required number of characters
  };
  ```
- Next we prepare a function to print the text on the image. In `photo.helper.js`, add:
  ```javascript
  photoHelper.putTextOnImage = async (
    originalImagePath,
    outputMemePath,
    texts
  ) => {
    try {
      const image = await Jimp.read(originalImagePath);
      const dimension = {
        width: image.bitmap.width,
        height: image.bitmap.height,
      };
      const promises = texts.map(async (text) => {
        const font = await Jimp.loadFont(
          Jimp[`FONT_SANS_${text.size}_${text.color}`]
        );
        await image.print(
          font,
          0,
          0,
          {
            text: text.content,
            alignmentX: Jimp[text.alignmentX],
            alignmentY: Jimp[text.alignmentY],
          },
          dimension.width,
          dimension.height
        );
      });
      await Promise.all(promises);
      await image.writeAsync(outputMemePath);
    } catch (err) {
      throw err;
    }
  };
  ```

We usually don't put the functions that handle requests in `routes/..`. Instead we will create controllers.

- Create `controllers/memeController.js`:
  ```javascript
  const fs = require("fs");
  const utilsHelper = require("../helpers/utils.helper");
  const photoHelper = require("../helpers/photo.helper");

  const memeController = {};

  memeController.createMeme = async (req, res, next) => {
    try {
      // Read data from the json file
      let rawData = fs.readFileSync("memes.json");
      let memes = JSON.parse(rawData).memes;
      const { texts } = req.body;
      const meme = {};
      // Prepare data for the new meme
      meme.id = utilsHelper.generateRandomHexString(15);
      meme.originalImage = req.file.filename;
      meme.originalImagePath = req.file.path;
      meme.outputMemePath = `${req.file.destination}MEME_${meme.id}.${meme.originalImage.split(".").pop()}`;
      meme.texts = texts?.length ? texts.map((text) => JSON.parse(text)) : [];
      // Put text on image
      await photoHelper.putTextOnImage(
        meme.originalImagePath,
        meme.outputMemePath,
        meme.texts
      );
      // Add the new meme to the beginning of the list and save to the json file
      meme.createdAt = Date.now();
      meme.updatedAt = Date.now();
      memes.unshift(meme);
      fs.writeFileSync("memes.json", JSON.stringify({ memes }));

      return utilsHelper.sendResponse(
        res,
        200,
        true,
        meme,
        null,
        "The new meme has been created!"
      );
    } catch (err) {
      next(err);
    }
  };

  module.exports = memeController;
  ```

- Then put the function `createMeme()` in `memeApi.js` to handle the POST request:
```javascript
router.post(
  "/",
  uploader.single("image"),
  photoHelper.resize,
  memeController.createMeme
);
```
- Test with Postman
  - POST request `Create meme`, expect response 200
  - Create POST request `Create meme without image`, expect response 500 "Image required"
  - Create POST request `Create meme without texts`, expect response 200

### User can get the list of all memes with pagination

Now we have a bunch of test memes in the json file. Let's create an API to provide list of meme with pagination.

#### Task 4 - Create the `getMemes()` controller

Let's create the controller to handle the request and quickly test whether we can get the query params:
- In `memeController.js`, add:
  ```javascript
  memeController.getMemes = (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;

    console.log(page, perPage);
    res.status(200).json({ page, perPage });
  };
  ```
- In `memeApi.js`, change:
  ```diff
  /**
   * @route GET api/memes
   * @description Get all memes
   * @access Public
   */
  +router.get("/", memeController.getMemes);
  ```
- In Postman, change `Get all memes` URL to `{{url}}/api/memes?page=2&perPage=20`, expect to see response with according page and perPage.
- Now let's write some code to return the according memes given `page` and `pageNum`. In `memeController.js`, add:
  ```javascript
  memeController.getMemes = (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const perPage = parseInt(req.query.perPage) || 10;


      // Read data from the json file
      let rawData = fs.readFileSync("memes.json");
      let memes = JSON.parse(rawData).memes;
      // Calculate slicing
      const totalMemes = memes.length;
      const totalPages = Math.ceil(totalMemes / perPage);
      const offset = perPage * (page - 1);
      memes = memes.slice(offset, offset + perPage);

      return utilsHelper.sendResponse(
        res,
        200,
        true,
        { memes, totalPages },
        null,
        "Get memes successful"
      );
    } catch (err) {
      next(err);
    }
  };
  ```
- Open Postman request `Get all memes`, play around with `page` and `pageNum` and check the result. You might want to write some tests for this API.

### User can see a list of original images

This feature allows user to create meme based on original images that are uploaded by the other users. 

#### Task 5 - Create `getOriginalImages()` controller

We have the list of memes and in each meme we have the path to the original images. But before we return that (with pagination), we need to remove duplications first.

Similar to the previous task, let's create the controller and quickly test whether we can get the query params
- In `memeApi.js`, add
  ```javascript
  /**
   * @route GET api/memes/images
   * @description Get all memes
   * @access Public
   */
  router.get("/images", memeController.getOriginalImages);
  ```
- In `memeController.js`, add:
  ```javascript
  memeController.getOriginalImages = (req, res, next) => {
    try {
      const page = req.query.page || 1;
      const perPage = req.query.perPage || 10;

      // Read data from the json file
      let rawData = fs.readFileSync("memes.json");
      let memes = JSON.parse(rawData).memes;
      let originalImages = memes.map((item) => item.originalImagePath);
      originalImages = originalImages.filter(
        (item, i, arr) => arr.indexOf(item) === i
      );
      // Calculate slicing
      const totalMemes = memes.length;
      const totalPages = Math.ceil(totalMemes / perPage);
      const offset = perPage * (page - 1);
      originalImages = originalImages.slice(offset, offset + perPage);

      return utilsHelper.sendResponse(
        res,
        200,
        true,
        { originalImages, totalPages },
        null,
        "Get original images successful"
      );
    } catch (err) {
      next(err);
    }
  };
  ```
- Open Postman, create a new GET request to `{{url}}/api/memes/images?page=1&perPage=2` called `Get all original images` (very similar to `Get all memes`). Test the new API.

### User can edit the texts on the meme

In this feature, we allows user to edit the meme and change the content of the texts on it. So we will create a new API that handles PUT request to `api/memes/:id`. The idea is simple, we will take the original image and put the new texts on it. Basically we'll overwrite the old meme.

- Create a new route to `api/memes/:id`: In `memeApi.js`, add:
  ```javascript
  memeController.updateMeme = async (req, res, next) => {
    try {
      const memeId = req.params.id;
      // Read data from the json file
      let rawData = fs.readFileSync("memes.json");
      let memes = JSON.parse(rawData).memes;
      const index = memes.findIndex((meme) => meme.id === memeId);
      if (index === -1) {
        return utilsHelper.sendResponse(
          res,
          400,
          false,
          null,
          new Error("Meme not found"),
          null
        );
      }
      const meme = memes[index];
      meme.texts = req.body.texts || [];
      meme.updatedAt = Date.now();

      // Put text on image
      await photoHelper.putTextOnImage(
        meme.originalImagePath,
        meme.outputMemePath,
        meme.texts
      );
      fs.writeFileSync("memes.json", JSON.stringify({ memes }));
      return utilsHelper.sendResponse(
        res,
        200,
        true,
        meme,
        null,
        "Meme has been updated!"
      );
    } catch (err) {
      next(err);
    }
  };
  ```
- Test with Postman: Pick one meme id in the json file, then
  - Create PUT request e.g. `{{url}}/api/memes/80CC10FB2A9BBEF`, add in `Headers` `Content-Type: application/json`. In `body`, choose `raw`:
  ```json
  {
    "texts": [
                {
                    "size": 64,
                    "color": "WHITE",
                    "alignmentX": "HORIZONTAL_ALIGN_CENTER",
                    "alignmentY": "VERTICAL_ALIGN_BOTTOM",
                    "content": "This is an example"
                },
                {
                    "size": 32,
                    "color": "WHITE",
                    "alignmentX": "HORIZONTAL_ALIGN_CENTER",
                    "alignmentY": "VERTICAL_ALIGN_TOP",
                    "content": "This is an example"
                }
            ]
  }
  ```
  - Test without `texts`
  - Test with wrong meme ID



