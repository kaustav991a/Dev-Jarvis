import screenshot from "screenshot-desktop";
import fs from "fs/promises";

export async function captureScreen() {
  const imgPath = "./workspace/screen.png";

  await screenshot({ filename: imgPath });

  return imgPath;
}
