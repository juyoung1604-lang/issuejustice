#!/usr/bin/env node

import { spawn, spawnSync } from "node:child_process";

const PORT = 3000;
const extraArgs = process.argv.slice(2);

function listListeningPids(port) {
  const result = spawnSync(
    "lsof",
    ["-nP", `-iTCP:${port}`, "-sTCP:LISTEN", "-t"],
    { encoding: "utf8" },
  );

  if (result.status !== 0 || !result.stdout.trim()) {
    return [];
  }

  return [...new Set(result.stdout.trim().split(/\s+/))];
}

function readCommand(pid) {
  const result = spawnSync("ps", ["-p", pid, "-o", "command="], {
    encoding: "utf8",
  });
  return result.status === 0 ? result.stdout.trim() : "";
}

function stopIfSafe(pid) {
  const command = readCommand(pid);
  const isNextServer =
    command.includes("next-server") || command.includes("next dev");

  if (!isNextServer) {
    console.error(
      `Port ${PORT} is already in use by PID ${pid}${command ? ` (${command})` : ""}.`,
    );
    console.error("Stop that process first, then run npm run dev again.");
    process.exit(1);
  }

  const killed = spawnSync("kill", [pid], { stdio: "ignore" });
  if (killed.status !== 0) {
    console.error(`Failed to stop stale next server process PID ${pid}.`);
    process.exit(1);
  }

  console.log(`Stopped stale next server on port ${PORT} (PID ${pid}).`);
}

for (const pid of listListeningPids(PORT)) {
  stopIfSafe(pid);
}

const nextDev = spawn("next", ["dev", "-p", String(PORT), ...extraArgs], {
  stdio: "inherit",
});

nextDev.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
