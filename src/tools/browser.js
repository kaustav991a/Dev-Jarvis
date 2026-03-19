import { chromium } from "playwright";
import path from "path";
import fs from "fs/promises";

// We no longer need the 'browser' variable, just the persistent context
let context;
let page;

export async function openBrowser(rawUrl) {
  if (!rawUrl) return "Missing URL";

  let url = rawUrl;
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }

  try {
    if (!context) {
      console.log("[Jarvis] Launching Persistent AI Browser...");

      // Create a folder to store cookies and logins so Google trusts us
      const userDataDir = path.resolve("./workspace/chrome_data");
      await fs.mkdir(userDataDir, { recursive: true });

      // Launch a persistent context instead of a temporary browser
      context = await chromium.launchPersistentContext(userDataDir, {
        headless: false,
        args: ["--start-maximized"],
        viewport: null,
      });
    }

    // Grab the first open tab, or make a new one
    page =
      context.pages().length > 0 ? context.pages()[0] : await context.newPage();

    await page.bringToFront();
    await page.goto(url);

    return `Successfully opened ${url}. You must run 'web_analyze' next.`;
  } catch (err) {
    console.error(err);
    return `Browser failed to open URL. Error: ${err.message}`;
  }
}

export async function analyzeWebPage() {
  if (!page) return "Browser not opened. Open a URL first.";

  console.log("[Jarvis] Scanning DOM and mapping interactable elements...");
  await page.bringToFront();

  const elementsMap = await page.evaluate(() => {
    let idCounter = 1;
    const elements = [];
    const interactables = document.querySelectorAll(
      'a, button, input, textarea, select, [role="button"]',
    );

    interactables.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const id = idCounter++;
        el.setAttribute("data-jarvis-id", id);

        el.style.border = "2px solid red";
        el.style.backgroundColor = "rgba(255, 0, 0, 0.1)";

        const badge = document.createElement("div");
        badge.textContent = id;
        badge.style.position = "absolute";
        badge.style.top = rect.top + window.scrollY + "px";
        badge.style.left = rect.left + window.scrollX + "px";
        badge.style.backgroundColor = "red";
        badge.style.color = "white";
        badge.style.fontSize = "12px";
        badge.style.fontWeight = "bold";
        badge.style.padding = "2px 4px";
        badge.style.zIndex = "2147483647";
        badge.style.pointerEvents = "none";
        badge.style.borderRadius = "3px";
        document.body.appendChild(badge);

        const text =
          el.innerText ||
          el.value ||
          el.placeholder ||
          el.getAttribute("aria-label") ||
          "";

        elements.push({
          id: id.toString(),
          tag: el.tagName.toLowerCase(),
          text: text.trim().substring(0, 50).replace(/\n/g, " "),
        });
      }
    });
    return elements;
  });

  // FIX: Reduced to 50 to prevent crashing the local AI
  const mapString = elementsMap
    .filter((e) => e.text)
    .slice(0, 50)
    .map((e) => `[ID: ${e.id}] ${e.tag} - "${e.text}"`)
    .join("\n");

  return `PAGE ANALYZED. INTERACTABLE ELEMENTS:\n${mapString}\n\nTo interact, use web_click or web_type with the ID.`;
}

export async function clickWebElement(id) {
  if (!page) return "Browser not opened";
  try {
    await page.bringToFront();
    await page.click(`[data-jarvis-id="${id}"]`);
    return `Successfully clicked element [ID: ${id}]`;
  } catch (e) {
    return `Failed to click element [ID: ${id}]. It might be hidden or invalid.`;
  }
}

export async function typeWebElement(id, text) {
  if (!page) return "Browser not opened";
  try {
    await page.bringToFront();
    const selector = `[data-jarvis-id="${id}"]`;

    // THE BOUNCER: Check what kind of element the AI actually picked
    const tagName = await page.$eval(selector, (el) =>
      el.tagName.toLowerCase(),
    );

    if (tagName !== "input" && tagName !== "textarea") {
      // Reject the action and feed the error directly back to the AI's brain
      return `Failed: Element [ID: ${id}] is a '${tagName}', not a text box! You CANNOT type into buttons. Look at the analysis list again and find the 'input' or 'textarea' ID.`;
    }

    // If it passes the check, type like a human
    await page.click(selector);

    // Clear the field first just in case there is old text
    await page.evaluate(
      (sel) => (document.querySelector(sel).value = ""),
      selector,
    );

    await page.keyboard.type(text, { delay: 50 });
    await page.keyboard.press("Enter");

    return `Successfully typed "${text}" into element [ID: ${id}] and pressed Enter.`;
  } catch (e) {
    return `Failed to type in element [ID: ${id}]. Error: ${e.message}`;
  }
}
