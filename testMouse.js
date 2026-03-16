import { mouse, Button } from "@nut-tree-fork/nut-js";

(async () => {
  await mouse.click(Button.LEFT);
  console.log("Mouse click executed");
})();
