const { withDangerousMod } = require("@expo/config-plugins");
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function withExpoWebCache(config) {
  // Try to fix permissions and create directory immediately when config is loaded
  try {
    const expoDir = path.join(process.cwd(), ".expo");
    execSync(`chmod -R 777 "${expoDir}" 2>/dev/null || true`, { stdio: "ignore" });
    fs.mkdirSync(path.join(expoDir, "web", "cache"), { recursive: true });
  } catch (e) {
    // Ignore - will try again in the mod
  }

  return withDangerousMod(config, [
    "ios",
    async (config) => {
      try {
        const projectRoot = config.modRequest.projectRoot;
        const expoDir = path.join(projectRoot, ".expo");
        execSync(`chmod -R 777 "${expoDir}" 2>/dev/null || true`, { stdio: "ignore" });
        fs.mkdirSync(path.join(expoDir, "web", "cache"), { recursive: true });
      } catch (e) {
        console.warn("[withExpoWebCache] Could not create .expo/web/cache:", e.message);
      }
      return config;
    },
  ]);
}

module.exports = withExpoWebCache;
