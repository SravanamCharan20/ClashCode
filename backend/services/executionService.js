import os from "os";
import path from "path";
import fs from "fs/promises";
import { spawn } from "child_process";

const EXECUTION_TIMEOUT_MS = 4000;
const MAX_OUTPUT_LENGTH = 20000;

const languageConfig = {
  javascript: {
    extension: "js",
    command: "node",
    args: (filePath) => [filePath],
  },
  python: {
    extension: "py",
    command: "python3",
    args: (filePath) => [filePath],
  },
};

const truncateOutput = (value) =>
  value.length > MAX_OUTPUT_LENGTH
    ? `${value.slice(0, MAX_OUTPUT_LENGTH)}\n...output truncated...`
    : value;

export const executeCode = async ({ code, language, input }) => {
  const config = languageConfig[language];

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "clashcode-"));
  const filePath = path.join(tempDir, `solution.${config.extension}`);

  await fs.writeFile(filePath, code, "utf8");

  return new Promise((resolve) => {
    let stdout = "";
    let stderr = "";
    let finished = false;
    let timedOut = false;

    const child = spawn(config.command, config.args(filePath), {
      cwd: tempDir,
      stdio: ["pipe", "pipe", "pipe"],
    });

    const cleanup = async () => {
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch {}
    };

    const finalize = async (result) => {
      if (finished) return;
      finished = true;
      clearTimeout(timeoutId);
      await cleanup();
      resolve(result);
    };

    const timeoutId = setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL");
    }, EXECUTION_TIMEOUT_MS);

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
      if (stdout.length > MAX_OUTPUT_LENGTH) {
        stdout = stdout.slice(0, MAX_OUTPUT_LENGTH);
      }
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
      if (stderr.length > MAX_OUTPUT_LENGTH) {
        stderr = stderr.slice(0, MAX_OUTPUT_LENGTH);
      }
    });

    child.on("close", async (codeValue, signal) => {
      if (timedOut) {
        return finalize({
          success: false,
          errorType: "timeout",
          stderr: "Execution timed out",
          stdout: truncateOutput(stdout),
        });
      }

      if (signal || codeValue !== 0) {
        return finalize({
          success: false,
          errorType: "runtime",
          stderr: truncateOutput(stderr),
          stdout: truncateOutput(stdout),
        });
      }

      return finalize({
        success: true,
        stdout: truncateOutput(stdout),
        stderr: "",
      });
    });

    child.stdin.write(input || "");
    child.stdin.end();
  });
};