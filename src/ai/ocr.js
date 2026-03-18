import Tesseract from "tesseract.js";

export async function extractText(imagePath) {
  const result = await Tesseract.recognize(imagePath, "eng", {
    tessedit_pageseg_mode: 11, // assume block of text
    logger: (m) => {
      if (m.status === "recognizing text") {
        console.log(`OCR: ${Math.round(m.progress * 100)}%`);
      }
    },
  });

  /* ✅ SAFE ACCESS */
  const wordsRaw = result?.data?.words || [];

  /* fallback → split full text if words missing */
  if (!wordsRaw.length && result?.data?.text) {
    console.log("⚠️ No word boxes, falling back to plain text");

    return result.data.text.split(/\s+/).map((t, i) => ({
      text: t,
      x: 0,
      y: 0,
      w: 0,
      h: 0,
    }));
  }

  return wordsRaw.map((w) => ({
    text: w.text,
    x: w.bbox.x0,
    y: w.bbox.y0,
    w: w.bbox.x1 - w.bbox.x0,
    h: w.bbox.y1 - w.bbox.y0,
  }));
}
