import screenshot from "screenshot-desktop";

export async function captureScreen() {
  const imgPath = "./workspace/screen.png";

  // Capture once directly to the target path
  await screenshot({ filename: imgPath });

  return imgPath;
}
