// Simple integration test that starts the mock model server and calls aiService.chatWithAssistant
process.env.LOCAL_MODEL_URL =
  process.env.LOCAL_MODEL_URL || "http://localhost:8000";

// Start the mock model server by requiring it (it listens on port 8000 by default)
const http = require("http");
const { spawn } = require("child_process");

const aiService = require("../src/services/aiService");

async function run() {
  try {
    const conversation = [{ role: "user", content: "Hello, I need help." }];
    const localUrl = process.env.LOCAL_MODEL_URL || "http://localhost:8000";
    let spawned = null;
    const reachable = await waitForServer(
      `${localUrl.replace(/\/$/, "")}/chat`,
    );
    if (!reachable) {
      spawned = spawn(process.execPath, ["mock_model_server.js"], {
        cwd: __dirname + "/../",
        env: { ...process.env, MOCK_MODEL_PORT: "8000" },
        stdio: ["ignore", "inherit", "inherit"],
      });
      const ready = await waitForServer(
        `${localUrl.replace(/\/$/, "")}/chat`,
        5000,
      );
      if (!ready) {
        console.error("Mock server did not start in time");
        if (spawned) spawned.kill();
        process.exit(3);
      }
    }

    const reply = await aiService.chatWithAssistant(conversation);
    console.log("Integration test reply:", reply);

    // Accept any non-empty string reply from the mock model. The mock server
    // responses were improved and no longer include the literal
    // "Mock chat reply" phrase; tests should assert that a reply exists.
    if (!reply || typeof reply !== "string" || reply.trim().length === 0) {
      console.error("Unexpected reply from mock model");
      process.exit(2);
    }

    console.log("Integration test passed");
    if (spawned) spawned.kill();
    process.exit(0);
  } catch (err) {
    console.error("Integration test failed:", err);
    process.exit(1);
  }
}

async function waitForServer(url, timeout = 5000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      await new Promise((res, rej) => {
        const req = http.request(
          url,
          { method: "POST", timeout: 1000 },
          (r) => {
            // we only need to know it's reachable
            res();
          },
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
run();
