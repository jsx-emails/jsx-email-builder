import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
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
  const templateNameMaxLength =
    params.templateNameMaxLength || config.templateNameMaxLength || null;
  const languages = params.languages || config.languages || [];

  // 1. get all the templates
  const templates = getEmailTemplatesList({
    templatesDir,
    templatesPostFix,
  });

  // 2. check template names length
  if (templateNameMaxLength) {
    templates.forEach((template) => {
      const templateName = path.basename(template, templatesPostFix);
      if (templateName.length > templateNameMaxLength) {
        console.error(
          chalk.red.bold("Error: "),
          chalk.red(
            `"${templateName}" is too long for a template name(${templateName.length} chars). Max length is ${templateNameMaxLength}.`
          )
        );
        process.exit(1);
      }
    });
  }

  // 3. compile them in parallel
  let templatesChunks = [];
  const chunkSize = 1; // Iman: combination of parallel threads and with global values like subject can introduce issues
  for (let i = 0; i < templates.length; i += chunkSize) {
    templatesChunks = templates.slice(i, i + chunkSize);
    const compilePromises = templatesChunks.map((templateRelativePath) => {
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

    // 4. write the results to the dist folder
    results.forEach((compileResult, index) => {
      const templatePath = templatesChunks[index];
      // if html directory doesn't exist, create it
      const distDir = path.join(
        process.cwd(),
        `./dist/${path.dirname(templatePath)}`
      );
      if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
      }
      const defaultLang = languages.find((lang) => lang.default);
      const langDir = defaultLang?.langDir ? defaultLang.code : "";
      const htmlRelativePath = templatePath.replace(templatesPostFix, ".html");
      const htmlAbsolutePath = path.join(
        process.cwd(),
        `./dist/${htmlRelativePath}`,
        langDir
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
  }

  // 5. cleanup
  cleanupAll();
}

export default build;
