import fs from "fs-extra";
import path from "path";
import { getEmailTemplatesList } from "./template-finder.js";
import { compile, cleanupAll } from "./compiler.js";
import { getConfig } from "./config.js";
import createSubjectTemplate from "./subject-creator.js";

async function build(params) {
  const config = getConfig();
  const templatesDir =
    params.templatesDir || config.templatesDir || "./email-templates";
  const templatesPostFix =
    params.templatesPostFix || config.templatesPostFix || ".template.tsx";
  const subjectRequired =
    params.subjectRequired || config.subjectRequired || true;

  // 1. get all the templates
  const templates = getEmailTemplatesList({
    templatesDir,
    templatesPostFix,
  });

  // 2. compile them in 8 parallel threads
  const compilePromises = templates.map((templateRelativePath) => {
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
  const results = await Promise.all(compilePromises);

  // 3. write the results to the dist folder
  results.forEach((compileResult, index) => {
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
    fs.writeFileSync(htmlAbsolutePath, compileResult.html);

    const templateName = path.basename(templatePath, templatesPostFix);
    if (subjectRequired) {
      if (!compileResult.subject) {
        throw new Error(
          `Subject is not defined in the template ${templatePath}.\n` +
            "Hint: you can define the subject in the template by calling `setSubject('A fantastic subject');`"
        );
      }
      createSubjectTemplate({
        templateDir: path.dirname(htmlAbsolutePath),
        emailTemplateName: templateName,
        subject: compileResult.subject,
      });
    }

    Object.keys(compileResult.localized).forEach((lang) => {
      // put the localized html files in a subfolder with the language name:
      const localizedHtmlRelativePath = templatePath
        .replace(templatesPostFix, ".html")
        .replace(/([^/]+)$/, `${lang}/$1`);
      const localizedHtmlAbsolutePath = path.join(
        process.cwd(),
        `./dist/${localizedHtmlRelativePath}`
      );
      fs.ensureDirSync(path.dirname(localizedHtmlAbsolutePath));
      fs.writeFileSync(
        localizedHtmlAbsolutePath,
        compileResult.localized[lang].html
      );

      if (subjectRequired) {
        if (!compileResult.localized[lang].subject) {
          throw new Error(
            `Subject is not defined in the template ${templatePath} for the language "${lang}".\n` +
              `Hint: you need to define translations for the subject in your translation file for the language "${lang}".\n` +
              "Hint: if you already have translations for the subject, check the key name in the translation file."
          );
        }
        createSubjectTemplate({
          templateDir: path.dirname(localizedHtmlAbsolutePath),
          emailTemplateName: templateName,
          subject: compileResult.localized[lang].subject,
        });
      }
    });
  });

  // 4. cleanup
  cleanupAll();
}

export default build;
