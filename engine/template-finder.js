import fs from "fs";
import path from "path";
import { getConfig } from "./config.js";

/**
 * @returns {string[]}
 */
export function getEmailTemplatesList() {
  const {
    templates: { templatesDir, templatesPostfix },
  } = getConfig();
  const result = [];

  function traverseDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
      console.error(`[Template Finder]: Directory ${dirPath} does not exist`);
      return [];
    }

    const files = fs.readdirSync(dirPath);
    // filter files that end with templatesPostfix (e.g .template.tsx)
    const templateFiles = files.filter((file) =>
      file.endsWith(templatesPostfix),
    );

    // loop through each template file and create a route for it
    templateFiles.forEach((templateFile) => {
      const templatePath = path.join(dirPath, templateFile);
      const templateRelativePath = `/${path.relative(
        templatesDir,
        templatePath,
      )}`;
      result.push(templateRelativePath);
    });

    // recursively traverse subdirectories
    const subDirs = files.filter((file) =>
      fs.statSync(path.join(dirPath, file)).isDirectory(),
    );
    subDirs.forEach((subDir) => traverseDir(path.join(dirPath, subDir)));
  }
  traverseDir(templatesDir);

  return result;
}
