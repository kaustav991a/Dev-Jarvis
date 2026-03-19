// import Tesseract from "tesseract.js";

// export async function extractText(imagePath) {
//   const result = await Tesseract.recognize(imagePath, "eng", {
//     tessedit_pageseg_mode: 11, // assume block of text
//     logger: (m) => {
//       if (m.status === "recognizing text") {
//         console.log(`OCR: ${Math.round(m.progress * 100)}%`);
//       }
//     },
//   });

//   /* ✅ SAFE ACCESS */
//   const wordsRaw = result?.data?.words || [];

//   /* fallback → split full text if words missing */
//   if (!wordsRaw.length && result?.data?.text) {
//     console.log("⚠️ No word boxes, falling back to plain text");

//     return result.data.text.split(/\s+/).map((t, i) => ({
//       text: t,
//       x: 0,
//       y: 0,
//       w: 0,
//       h: 0,
//     }));
//   }

//   return wordsRaw.map((w) => ({
//     text: w.text,
//     x: w.bbox.x0,
//     y: w.bbox.y0,
//     w: w.bbox.x1 - w.bbox.x0,
//     h: w.bbox.y1 - w.bbox.y0,
//   }));
// }

// src/ai/ocr.js

import Tesseract from "tesseract.js";
import sharp from "sharp";

export async function extractText(imagePath) {
  const processedPath = imagePath.replace(".png", "_processed.png");
  const SCALE_FACTOR = 3;

  try {
    const metadata = await sharp(imagePath).metadata();

    // Resize 3x and Grayscale (Works beautifully for Light Mode)
    await sharp(imagePath)
      .resize(metadata.width * SCALE_FACTOR)
      .grayscale()
      .toFile(processedPath);
  } catch (err) {
    console.error("Image processing failed", err);
  }

  const imageToRead = processedPath || imagePath;

  const result = await Tesseract.recognize(imageToRead, "eng", {
    tessedit_pageseg_mode: 11,
    logger: () => {},
  });

  const wordsRaw = result?.data?.words || [];

  return wordsRaw.map((w) => ({
    text: w.text,
    x: Math.round((w.bbox?.x0 || 0) / SCALE_FACTOR),
    y: Math.round((w.bbox?.y0 || 0) / SCALE_FACTOR),
    w: Math.round((w.bbox?.x1 - w.bbox?.x0 || 0) / SCALE_FACTOR),
    h: Math.round((w.bbox?.y1 - w.bbox?.y0 || 0) / SCALE_FACTOR),
  }));
}
