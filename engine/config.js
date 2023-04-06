import fs from "fs-extra";
import path from "path";
import parseArgs from "minimist";

export function getConfig() {
  const args = parseArgs(process.argv.slice(2));
  const configDir = args.configDir || "";
  const configPath = path.join(
    process.cwd(),
    configDir,
    "./jsx-email-builder.json"
  );

  if (fs.existsSync(configPath)) {
    const config = fs.readJsonSync(configPath);
    return config;
  }

  console.warn("No config file found. Using default config.");
  return {};
}

export default getConfig;
