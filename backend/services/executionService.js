import os from "os";
import path from "path";
import fs from "fs/promises";
import { exec } from "child_process";

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

  const quotedCodePath = `"${path.resolve(filePath)}"`;
  const quotedInputPath = `"${path.resolve(inputPath)}"`;
  let command;

  if (language === "javascript") {
    command = `
    docker run --rm \
    --memory=100m \
    --cpus=0.5 \
    --network=none \
    -v ${quotedCodePath}:/app/code.js \
    -v ${quotedInputPath}:/app/input.txt \
    clashcode-runner \
    sh -c "node /app/code.js < /app/input.txt"
    `;
  } else if (language === "python") {
    command = `
    docker run --rm \
    --memory=100m \
    --cpus=0.5 \
    --network=none \
    -v ${quotedCodePath}:/app/code.py \
    -v ${quotedInputPath}:/app/input.txt \
    clashcode-runner \
    sh -c "python3 /app/code.py < /app/input.txt"
    `;
  }

  return new Promise((resolve) => {
    exec(
      command,
      { timeout: EXECUTION_TIMEOUT_MS },
      async (error, stdout, stderr) => {
        try {
          await fs.rm(tempDir, { recursive: true, force: true });
        } catch {}

        if (error) {
          const errorMessage = stderr || error.message || "";
          const isTimeout =
            error.killed ||
            error.signal === "SIGTERM" ||
            error.code === null ||
            errorMessage.toLowerCase().includes("timed out");
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
                : errorMessage,
            ),
            stdout: truncateOutput(stdout),
          });
        }

        return resolve({
          success: true,
          stdout: truncateOutput(stdout),
          stderr: "",
        });
      },
    );
  });
};
