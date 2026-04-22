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
  if (!config) {
    return {
      success: false,
      errorType: "validation",
      stderr: "Unsupported language",
      stdout: "",
    };
  }

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "clashcode-"));
  const filePath = path.join(tempDir, `solution.${config.extension}`);

  const inputPath = path.join(tempDir, "input.txt");

  await fs.writeFile(filePath, code, "utf8");
  await fs.writeFile(inputPath, input || "", "utf8");

  const runtimeCmd = language === "javascript" ? "node" : "python3";

  const command = `docker run --rm \\
  --memory=100m \\
  --cpus=0.5 \\
  --pids-limit=64 \\
  --network=none \\
  --read-only \\
  --security-opt=no-new-privileges \\
  -v ${tempDir}:/app \\
  clashcode-runner \\
  sh -c "${runtimeCmd} /app/solution.${config.extension} < /app/input.txt"`;

  return new Promise((resolve) => {
    const child = spawn("sh", ["-c", command], {
      timeout: EXECUTION_TIMEOUT_MS,
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("close", async (code, signal) => {
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch {}

      const isTimeout = signal === "SIGTERM";
      const isError = code !== 0;

      if (isError) {
        const errorMessage = stderr || "";
        const isDockerFailure =
          errorMessage.toLowerCase().includes("docker") ||
          errorMessage.toLowerCase().includes("clashcode-runner") ||
          errorMessage.toLowerCase().includes("unable to find image");

        return resolve({
          success: false,
          errorType: isTimeout
            ? "timeout"
            : isDockerFailure
            ? "container"
            : "runtime",
          stderr: truncateOutput(
            isTimeout
              ? "Execution timed out after 4 seconds. This usually means an infinite loop or very slow solution."
              : errorMessage
          ),
          stdout: truncateOutput(stdout),
        });
      }

      return resolve({
        success: true,
        stdout: truncateOutput(stdout),
        stderr: "",
      });
    });
  });
};
