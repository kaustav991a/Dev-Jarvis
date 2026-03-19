import screenshot from "screenshot-desktop";
import fs from "fs/promises";
import path from "path";

export async function captureScreen() {
  // Generate a unique filename using the current timestamp
  const fileName = `screen_${Date.now()}.png`;
  const imgPath = path.resolve("./workspace", fileName);

  try {
    await fs.mkdir(path.dirname(imgPath), { recursive: true });

    const imgBuffer = await screenshot();
    await fs.writeFile(imgPath, imgBuffer);

    return imgPath; // Return the unique path so other functions can use it
  } catch (err) {
    console.error("[Jarvis] Screenshot failed:", err);
    throw err;
  }
}
