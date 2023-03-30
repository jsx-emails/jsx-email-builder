import fs from "fs-extra";
import path from "path";
import { getEmailTemplatesList } from "./template-finder.js";
import { compile, cleanupAll } from "./compiler.js";
import { getConfig } from "./config.js";

async function build(params) {
  const config = getConfig();
  const templatesDir =
    params.templatesDir || config.templatesDir || "./email-templates";
  const templatesPostFix =
    params.templatesPostFix || config.templatesPostFix || ".template.tsx";

  // 1. get all the templates
  const templates = getEmailTemplatesList({
    templatesDir,
    templatesPostFix,
  });

  // 2. compile them in 8 parallel threads
  const promises = templates.map((templateRelativePath) => {
    const templatePath = path.join(
      process.cwd(),
      templatesDir,
      templateRelativePath
    );
    return compile({
      templatePath,
      i18nEnabled: true, // TODO: make it configurable
      compileAllLangs: true,
      prettify: true, // TODO: make it configurable
    });
  });
  const results = await Promise.all(promises);

  // 3. write the results to the dist folder
  results.forEach((result, index) => {
    const templatePath = templates[index];
    // if html directory doesn't exist, create it
    const distDir = path.join(
      process.cwd(),
      `./dist/${path.dirname(templatePath)}`
    );
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }
    const htmlRelativePath = templatePath.replace(templatesPostFix, ".html");
    const htmlAbsolutePath = path.join(
      process.cwd(),
      `./dist/${htmlRelativePath}`
    );
    fs.writeFileSync(htmlAbsolutePath, result.html);
    Object.keys(result.localized).forEach((lang) => {
      // put the localized html files in a subfolder with the language name:
      const localizedHtmlRelativePath = templatePath
        .replace(templatesPostFix, ".html")
        .replace(/([^/]+)$/, `${lang}/$1`);
      const localizedHtmlAbsolutePath = path.join(
        process.cwd(),
        `./dist/${localizedHtmlRelativePath}`
      );
      fs.ensureDirSync(path.dirname(localizedHtmlAbsolutePath));
      fs.writeFileSync(localizedHtmlAbsolutePath, result.localized[lang]);
    });
  });

  // 4. cleanup
  cleanupAll();
}

export default build;
