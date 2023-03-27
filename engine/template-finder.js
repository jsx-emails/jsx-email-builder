import fs from "fs";
import path from "path";

export function getEmailTemplatesList(params) {
  const { templatesDir, templatesPostFix } = params;
  const result = [];

  function traverseDir(dirPath) {
    const files = fs.readdirSync(dirPath);
    // filter files that end with templatesPostFix (e.g .template.tsx)
    const templateFiles = files.filter((file) =>
      file.endsWith(templatesPostFix)
    );

    // loop through each template file and create a route for it
    templateFiles.forEach((templateFile) => {
      const templatePath = path.join(dirPath, templateFile);
      const templateRelativePath = `/${path.relative(
        templatesDir,
        templatePath
      )}`;
      result.push(templateRelativePath);
    });

    // recursively traverse subdirectories
    const subDirs = files.filter((file) =>
      fs.statSync(path.join(dirPath, file)).isDirectory()
    );
    subDirs.forEach((subDir) => traverseDir(path.join(dirPath, subDir)));
  }
  traverseDir(templatesDir);

  return result;
}
