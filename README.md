# 🤖 J.A.R.V.I.S. - Autonomous Local AI Agent

J.A.R.V.I.S. is an advanced, fully local autonomous AI agent capable of controlling your desktop, navigating the web, and executing multi-step tasks. 

Unlike standard automation scripts that rely purely on brittle screen-scraping, J.A.R.V.I.S. uses a hybrid architecture: natively reading the DOM for lightning-fast web browsing, utilizing OCR for desktop apps, and falling back to a local Vision model (LLaVA) when all else fails. It runs entirely locally via Ollama, ensuring 100% privacy.

## ✨ Features

* **🧠 Autonomous ReAct Loop:** J.A.R.V.I.S. doesn't just execute single commands; it thinks, acts, observes the result, and plans its next move until the overarching goal is completed.
* **🌐 Native Web Browsing:** Powered by Playwright, it injects visual ID badges directly into the HTML DOM, allowing the AI to "see" and interact with complex web pages flawlessly without relying on OCR. Uses a persistent context to stay logged into sites and bypass CAPTCHAs.
* **🖱️ OS-Level Desktop Control:** Uses `@nut-tree/nut-js` to physically move the mouse and click elements on local desktop applications (like VS Code or File Explorer).
* **👁️ Local Vision & OCR:** Combines heavily optimized `tesseract.js` (with 3x scaling and grayscale thresholding for Dark/Light mode support) with local `LLaVA` for verifying actions and finding icons without text.
* **🛡️ Security Guardrails:** Includes strict path guarding to keep file operations contained within the `./workspace` directory and a command filter to block destructive terminal operations.

## 🛠️ Prerequisites

Before running J.A.R.V.I.S., you must have the following installed on your machine:
1.  **[Node.js](https://nodejs.org/)** (v18 or higher)
2.  **[Git](https://git-scm.com/)**
3.  **[Ollama](https://ollama.com/)** (To run the local AI models)

## 🚀 Installation & Setup

**1. Clone the repository**
```bash
git clone [https://github.com/your-username/jarvis-agent.git](https://github.com/your-username/jarvis-agent.git)
cd jarvis-agent
