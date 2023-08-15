import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import { getEmailTemplatesList } from "./template-finder.js";
import { compile, cleanupAll } from "./compiler.js";
import { getConfig, DEST_TYPES } from "./config.js";
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
            `"${templateName}" is too long for a template name(${templateName.length} chars). Max length is ${templateNameMaxLength}.`,
          ),
          "\n",
          "\n",
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
        chalk.bold(templateRelativePath),
      );
      const templatePath = path.join(
        process.cwd(),
        templatesDir,
        templateRelativePath,
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
      const { htmlPath, htmlDir } = getHtmlBuildPath(templatePath, langDir);
      fs.ensureDirSync(htmlDir);
      fs.writeFileSync(htmlPath, compileResult.html);

      if (subjectRequired) {
        if (!compileResult.subject) {
          console.error(
            chalk.red.bold("Error: "),
            chalk.red("Subject is not defined in the template.\n"),
            "\n",
            chalk.bold("Hint: "),
            "you can define the subject in the template by calling `setSubject('A fantastic subject');`",
            "\n",
            "\n",
          );
          process.exit(1);
        }
        createSubjectTemplate({
          destDir: path.dirname(htmlPath),
          emailTemplateName: templateName,
          subject: compileResult.subject,
        });
      }

      Object.keys(compileResult.localized).forEach((lang) => {
        const { htmlPath: localizedHtmlPath, htmlDir: localizedHtmlDir } =
          getHtmlBuildPath(templatePath, lang);
        fs.ensureDirSync(localizedHtmlDir);
        fs.writeFileSync(localizedHtmlPath, compileResult.localized[lang].html);

        if (subjectRequired) {
          if (!compileResult.localized[lang].subject) {
            console.error(
              "\n",
              chalk.red.bold("Error: "),
              chalk.red(
                `Couldn't find translation for the subject in the translation file for the language code "${lang}".`,
              ),
              "\n",
              chalk.bold("Hint 1: "),
              `You need to define translations for the subject in your translation file (eg. template-name.${lang}.json)\n`,
              chalk.bold("Hint 2: "),
              "If you already have translation for the subject in the translation file, then check the translation key. It should be the same as the string passed to `setSubject()` in the template.",
              "\n",
              "\n",
            );
            process.exit(1);
          }
          createSubjectTemplate({
            destDir: path.dirname(localizedHtmlPath),
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

function getHtmlBuildPath(templatePath, langCode) {
  const {
    templates: { templatesPostfix },
    build: { destDir },
  } = getConfig();

  const templateName = path.basename(templatePath, templatesPostfix);
  let htmlDir = path.join(process.cwd(), "./dist");

  if (destDir === DEST_TYPES.PER_FIRST_LEVEL_DIR) {
    const firstLevelDir = path.dirname(templatePath).split("/")[0];
    htmlDir = path.join(htmlDir, firstLevelDir);
  } else if (destDir === DEST_TYPES.SAME_AS_TEMPLATE) {
    htmlDir = path.join(htmlDir, path.dirname(templatePath));
  }

  if (langCode) {
    htmlDir = path.join(htmlDir, langCode);
  }

  const htmlPath = path.join(htmlDir, templateName + ".html");
  return { htmlPath, htmlDir };
}

export default build;
