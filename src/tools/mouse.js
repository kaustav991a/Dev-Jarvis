import { mouse, Button } from "@nut-tree-fork/nut-js";

export async function clickMouse() {
  await mouse.click(Button.LEFT);
  return "mouse clicked";
}
