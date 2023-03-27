import fs from "fs-extra";
import path from "path";

export function getConfig() {
  const configPath = path.join(process.cwd(), "./jsx-email-builder.json");

  if (fs.existsSync(configPath)) {
    const config = fs.readJsonSync(configPath);
    return config;
  }

  return {};
}

export default getConfig;
