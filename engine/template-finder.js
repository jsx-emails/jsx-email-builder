import chalk from "chalk";
import { globSync } from "glob";
import path from "path";
import { getConfig, DEFAULT_FILTER } from "./config.js";

/**
 * @returns {string[]}
 */
export function getEmailTemplatesList() {
  const {
    templates: { templatesDir, templatesPostfix, filter },
  } = getConfig();

  if (filter !== DEFAULT_FILTER) {
    console.log(
      chalk.blueBright.bold("[Template Finder]: "),
      chalk.blueBright(
        `Templates filtered by "${filter}${templatesPostfix}" glob.`
      )
    );
  }

  const templateFiles = globSync(filter + templatesPostfix, {
    ignore: "**/node_modules/**",
    cwd: templatesDir,
    nodir: true,
    posix: true,
  })
    .reverse()
    .map((file) => path.sep + file);

  return templateFiles;
}
