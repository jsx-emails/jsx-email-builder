import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import { getEmailTemplatesList } from "./template-finder.js";
import { compile, cleanupAll } from "./compiler.js";
import { getConfig } from "./config.js";
import createSubjectTemplate from "./subject-creator.js";

async function build() {
  const {
    templates: {
      templatesDir,
      templatesPostfix,
      templateNameMaxLength,
      subjectRequired,
    },
    translation: { languages, onlyDefaultLang },
  } = getConfig();

  // 1. get all the templates
  const templates = getEmailTemplatesList();

  // 2. check template names length
  if (templateNameMaxLength) {
    templates.forEach((template) => {
      const templateName = path.basename(template, templatesPostfix);
      if (templateName.length > templateNameMaxLength) {
        console.error(
          "\n",
          chalk.red.bold("Error: "),
          chalk.red(
            `"${templateName}" is too long for a template name(${templateName.length} chars). Max length is ${templateNameMaxLength}.`
          ),
          "\n",
          "\n"
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
      console.log(
        chalk.magenta.bold("Building template: "),
        chalk.bold(templateRelativePath)
      );
      const templatePath = path.join(
        process.cwd(),
        templatesDir,
        templateRelativePath
      );
      return compile({
        templatePath,
        i18nEnabled: true, // TODO: make it configurable
        compileAllLangs: !onlyDefaultLang,
        prettify: true, // TODO: make it configurable
      });
    });
    const results = await Promise.all(compilePromises);

    // 4. write the results to the dist folder
    results.forEach((compileResult, index) => {
      const templatePath = templatesChunks[index];
      const templateName = path.basename(templatePath, templatesPostfix);

      const defaultLang = languages.find((lang) => lang.default);
      const langDir = defaultLang?.langDir ? defaultLang.code : "";
      let htmlDir = path.join(
        process.cwd(),
        `./dist/${path.dirname(templatePath)}`
      );
      if (langDir) {
        htmlDir = path.join(htmlDir, langDir);
      }
      const htmlAbsolutePath = path.join(htmlDir, templateName + ".html");
      if (!fs.existsSync(htmlDir)) {
        fs.mkdirSync(htmlDir, { recursive: true });
      }
      fs.writeFileSync(htmlAbsolutePath, compileResult.html);

      if (subjectRequired) {
        if (!compileResult.subject) {
          console.error(
            chalk.red.bold("Error: "),
            chalk.red("Subject is not defined in the template.\n"),
            "\n",
            chalk.bold("Hint: "),
            "you can define the subject in the template by calling `setSubject('A fantastic subject');`",
            "\n",
            "\n"
          );
          process.exit(1);
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
          .replace(templatesPostfix, ".html")
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
            console.error(
              "\n",
              chalk.red.bold("Error: "),
              chalk.red(
                `Subject is not defined in the template for the language code "${lang}".\n`
              ),
              "\n",
              chalk.bold("Hint 1: "),
              `you need to define translations for the subject in your translation file for the language code "${lang}".\n`,
              chalk.bold("Hint 2: "),
              "if you already have translation for the subject in the translation file, check the translation key. It should be the same as the string passed to `setSubject()` in the template.",
              "\n",
              "\n"
            );
            process.exit(1);
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
