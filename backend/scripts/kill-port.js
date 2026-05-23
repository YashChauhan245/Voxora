import { exec } from "child_process";
import "dotenv/config";

const PORT = process.env.PORT || 5001;

const isWindows = process.platform === "win32";

function run(cmd) {
  return new Promise((resolve) => {
    exec(cmd, (err, stdout, stderr) => {
      resolve({ err, stdout: stdout?.toString() || "", stderr: stderr?.toString() || "" });
    });
  });
}

async function killPort() {
  try {
    if (isWindows) {
      // Find PID(s) listening on the port
      const { stdout } = await run(`netstat -ano | findstr :${PORT}`);
      const lines = stdout.split(/\r?\n/).filter(Boolean);
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && !isNaN(pid)) {
          console.log(`Killing PID ${pid} on port ${PORT}`);
          await run(`taskkill /PID ${pid} /F`);
        }
      }
    } else {
      // mac/linux
      const { stdout } = await run(`lsof -i :${PORT} -t || true`);
      const pids = stdout.split(/\r?\n/).filter(Boolean);
      for (const pid of pids) {
        console.log(`Killing PID ${pid} on port ${PORT}`);
        await run(`kill -9 ${pid}`);
      }
    }
  } catch (error) {
    // best-effort, don't fail the script
    console.error("kill-port script error (non-fatal):", error?.message || error);
  }
}

killed();

async function killed() {
  await killPort();
  // allow enough time for OS to release
  setTimeout(() => process.exit(0), 500);
}
