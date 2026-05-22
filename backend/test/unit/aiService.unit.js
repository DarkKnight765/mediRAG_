// Simple unit-style test that starts the mock model server if needed and verifies aiService.testAssistant
process.env.LOCAL_MODEL_URL =
  process.env.LOCAL_MODEL_URL || "http://localhost:8000";

const aiService = require("../../src/services/aiService");
const http = require("http");
const { spawn } = require("child_process");

async function waitForServer(url, timeout = 5000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      await new Promise((res, rej) => {
        const req = http.request(url, { method: "POST", timeout: 1000 }, (r) =>
          res(),
        );
        req.on("error", rej);
        req.on("timeout", () => req.destroy(new Error("timeout")));
        req.end();
      });
      return true;
    } catch (e) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }
  return false;
}

async function run() {
  const localUrl = process.env.LOCAL_MODEL_URL;
  let spawned = null;
  try {
    const reachable = await waitForServer(
      `${localUrl.replace(/\/$/, "")}/chat`,
    );
    if (!reachable) {
      spawned = spawn(process.execPath, ["mock_model_server.js"], {
        cwd: __dirname + "/../../",
        env: { ...process.env, MOCK_MODEL_PORT: "8000" },
        stdio: ["ignore", "inherit", "inherit"],
      });
      const ready = await waitForServer(
        `${localUrl.replace(/\/$/, "")}/chat`,
        5000,
      );
      if (!ready) {
        console.error("Mock server did not start");
        if (spawned) spawned.kill();
        process.exit(3);
      }
    }

    const res = await aiService.testAssistant();
    console.log("aiService.testAssistant response:", res);
    if (!res || typeof res !== "string") {
      console.error("Unexpected response");
      process.exit(2);
    }

    console.log("Unit test passed");
    if (spawned) spawned.kill();
    process.exit(0);
  } catch (err) {
    console.error("Unit test failed:", err);
    if (spawned) spawned.kill();
    process.exit(1);
  }
}

run();
