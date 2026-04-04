import { chromium } from "playwright";

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const logs = [];
  page.on("console", (msg) => {
    logs.push({ type: msg.type(), text: msg.text() });
  });

  page.on("pageerror", (error) => {
    logs.push({ type: "pageerror", text: error.message });
  });

  try {
    await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    const rootContent = await page.evaluate(() => {
      const root = document.getElementById("root");
      if (!root) return null;
      return {
        html: root.innerHTML.slice(0, 500),
        text: root.innerText.slice(0, 500),
        childCount: root.children.length,
      };
    });

    logs.push({ type: "root", text: JSON.stringify(rootContent) });
  } catch (err) {
    logs.push({ type: "navigation", text: err.message });
  }

  console.log("=== CONSOLE LOGS ===");
  logs.forEach((log) => console.log(`[${log.type}] ${log.text}`));

  await browser.close();
})();
