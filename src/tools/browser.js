import { chromium } from "playwright";

let browser;
let context;
let page; // Move page to module scope

export async function openBrowser(data) {
  const url = data?.url;
  if (!url) return "Missing URL";

  try {
    if (!browser) {
      browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
      context = browser.contexts()[0];
    }

    // Reuse page if it exists, otherwise create new
    page = page || (await context.newPage());
    await page.goto(url);

    return `Opened ${url}`;
  } catch (err) {
    console.error(err);
    return "Browser failed";
  }
}

export async function searchWeb(query) {
  if (!page) return "Browser not opened"; // Now page is accessible

  await page.goto("https://duckduckgo.com");
  await page.fill('input[name="q"]', query);
  await page.keyboard.press("Enter");
  await page.bringToFront();

  return "Search executed: " + query;
}
