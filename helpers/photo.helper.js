const Jimp = require("jimp");

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

// photoHelper.putTextOnImage = async (req, res, next) => {
//   if (req.file) {
//     Jimp.read(req.file.path, async (err, image) => {
//       if (err) next(err);
//       try {
//         const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
//         const dimension = {
//           width: image.bitmap.width,
//           height: image.bitmap.height,
//         };
//         const img = await image
//           .print(
//             font,
//             0,
//             0,
//             {
//               text: "This is an example",
//               alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
//               alignmentY: Jimp.VERTICAL_ALIGN_TOP,
//             },
//             dimension.width,
//             dimension.height
//           )
//           .print(
//             font,
//             0,
//             0,
//             {
//               text: "This is another example",
//               alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
//               alignmentY: Jimp.VERTICAL_ALIGN_BOTTOM,
//             },
//             dimension.width,
//             dimension.height
//           )
//           .write(req.file.path);
//         next();
//       } catch (err) {
//         next(err);
//       }
//     });
//   }
//   next();
// };

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

module.exports = photoHelper;
