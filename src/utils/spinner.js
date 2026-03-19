export class Spinner {
  constructor(text = "Working...") {
    this.text = text;
    this.frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
    this.interval = null;
    this.currentFrame = 0;
  }

  start(newText) {
    if (newText) this.text = newText;
    if (this.interval) return;

    process.stdout.write("\x1B[?25l"); // Hide the terminal cursor
    this.interval = setInterval(() => {
      // \r brings it to the start of the line, \x1b[K clears the line
      process.stdout.write(
        `\r\x1b[K${this.frames[this.currentFrame]} ${this.text}`,
      );
      this.currentFrame = (this.currentFrame + 1) % this.frames.length;
    }, 80);
  }

  stop(finalMessage = "") {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      process.stdout.write("\x1B[?25h"); // Show the terminal cursor again
      process.stdout.write(`\r\x1b[K${finalMessage}\n`);
    }
  }
}
