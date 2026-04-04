import { chromium } from "playwright";

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const logs = [];

  page.on("console", (msg) => {
    logs.push({ type: msg.type(), text: msg.text() });
  });

  page.on("pageerror", (error) => {
    logs.push({
      type: "pageerror",
      text: `${error.message}\n${error.stack || ""}`,
    });
  });

  try {
    const reg = await page.request.post(
      "http://127.0.0.1:3000/api/auth/register",
      {
        data: {
          name: `Crash Probe ${Date.now()}`,
          email: `probe_${Date.now()}@test.com`,
          password: "Pass123!",
        },
      },
    );

    const regData = await reg.json();
    const token = regData?.token;

    if (!token) {
      logs.push({
        type: "probe",
        text: `No token from register: ${JSON.stringify(regData)}`,
      });
    }

    await page.goto("http://127.0.0.1:3000", { waitUntil: "domcontentloaded" });
    await page.evaluate((t) => localStorage.setItem("token", t), token || "");
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(4000);

    const rootContent = await page.evaluate(() => {
      const root = document.getElementById("root");
      if (!root) return null;
      return {
        html: root.innerHTML.slice(0, 500),
        text: root.textContent?.slice(0, 500) || "",
        childCount: root.children.length,
      };
    });

    logs.push({ type: "root", text: JSON.stringify(rootContent) });
  } catch (err) {
    logs.push({
      type: "navigation",
      text: err instanceof Error ? err.message : String(err),
    });
  }

  console.log("=== AUTH CONSOLE LOGS ===");
  for (const log of logs) {
    console.log(`[${log.type}] ${log.text}`);
  }

  await browser.close();
})();
