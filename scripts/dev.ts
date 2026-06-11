import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { spawn } from "node:child_process";

const cwd = process.cwd();
const lockPath = join(cwd, ".next", "dev", "lock");
const port = process.env.PORT || "9792";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function stopExistingDevServer() {
  if (!existsSync(lockPath)) {
    return;
  }

  try {
    const lock = JSON.parse(readFileSync(lockPath, "utf8")) as {
      pid?: number;
      port?: number;
    };

    if (!lock.pid || lock.pid === process.pid) {
      return;
    }

    try {
      process.kill(lock.pid, 0);
    } catch {
      return;
    }

    console.log(
      `Stopping existing Next dev server for this repo (pid ${lock.pid}, port ${lock.port ?? "unknown"})...`,
    );
    process.kill(lock.pid, "SIGTERM");

    for (let attempt = 0; attempt < 30; attempt += 1) {
      await sleep(250);
      try {
        process.kill(lock.pid, 0);
      } catch {
        return;
      }
    }

    console.warn(`Existing dev server pid ${lock.pid} did not exit after SIGTERM.`);
  } catch (error) {
    console.warn("Could not parse .next/dev/lock, starting a fresh dev server anyway.");
    console.warn(error);
  }
}

async function main() {
  await stopExistingDevServer();

  const child = spawn("./node_modules/.bin/next", ["dev", "--port", port], {
    cwd,
    stdio: "inherit",
    shell: true,
    env: process.env,
  });

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }

    process.exit(code ?? 0);
  });
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
