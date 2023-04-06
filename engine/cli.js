#!/usr/bin/env node

import path from "path";
import parseArgs from "minimist";
import startServer from "./server.js";
import build from "./build.js";
import generateTranslations from "./generate-translations.js";
import { initializeNewProject } from "./init.js";
import fs from "fs-extra";

const logger = console;

function printHelp() {
  logger.log("[JSX-Email-Builder] Help");
  logger.log("  Commands:");
  logger.log("    help: Show this help");
  logger.log("    version: Show version");
  logger.log("    init: Initialize a new project");
  logger.log("      aliases: new, create");
  logger.log("    build: Build the email templates");
  logger.log("      aliases: compile");
  logger.log("    dev: Start the dev server");
  logger.log("      aliases: start, serve");
  logger.log("    gen-trans: Generate translation files");
  logger.log("      aliases: generate-translations, translations, trans");
}

function printVersion() {
  const workingDir = process.cwd();
  const packageJsonPath = path.join(workingDir, "package.json");
  const packageJson = fs.readJsonSync(packageJsonPath);
  logger.log(`[JSX-Email-Builder] ${packageJson.version}`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  switch (args?._?.[0]) {
    case "help":
      printHelp();
      break;
    case "version":
      printVersion();
      break;
    case "init":
    case "new":
    case "create":
      initializeNewProject(args);
      break;
    case "build":
    case "compile":
      await build(args);
      break;
    case "dev":
    case "start":
    case "serve":
      logger.log("[JSX-Email-Builder] Starting dev server...");
      await startServer(args);
      break;
    case "gen-trans":
    case "generate-translations":
    case "translations":
    case "trans":
      await generateTranslations(args);
      break;
    case undefined:
      logger.error("[JSX-Email-Builder] error: No command specified");
      process.exit(1);
      break;
    default:
      logger.error("[JSX-Email-Builder] error: Unknown command");
      process.exit(1);
  }
}

main();
