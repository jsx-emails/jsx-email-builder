import fs from "fs-extra";
import path from "path";
import { getEmailTemplatesList } from "./template-finder.js";
import { compile, cleanupAll } from "./compiler.js";
import { getConfig } from "./config.js";

async function generateTranslations(params) {
  const config = getConfig();
  const templatesDir =
    params.templatesDir || config.templatesDir || "./email-templates";
  const templatesPostFix =
    params.templatesPostFix || config.templatesPostFix || ".template.tsx";
  const subjectRequired =
    params.subjectRequired || config.subjectRequired || true;
  const translationsDir =
    params.translationsDir || config.translationsDir || "./translations";
  const languages = params.languages || config.languages || [];

  if (languages.length === 0) {
    console.error(
      "No languages specified. Please specify the languages in the config file or pass them as a parameter"
    );
    process.exit(1);
  }

  // 1. get all the templates
  const templates = getEmailTemplatesList({
    templatesDir,
    templatesPostFix,
  });

  // TODO: parallelize this:
  // 2. compile them to get the texts
  await Promise.all(
    templates.map(async (templateRelativePath) => {
      const templatePath = path.join(
        process.cwd(),
        templatesDir,
        templateRelativePath
      );
      const texts = {};
      const compileResult = await compile({
        templatePath,
        i18nEnabled: true, // TODO: make it configurable
        compileAllLangs: false,
        transCallback: (text) => {
          texts[text] = "";
          return text;
        },
      });

      // 3. generate and update the translation files
      if (texts.length === 0) {
        console.warn(`No texts for translation found in ${templatePath}`);
        return;
      }
      // if translations directory doesn't exist, create it
      const templateName = path.basename(templatePath, templatesPostFix);
      const distDir = path.join(
        process.cwd(),
        path.dirname(templateRelativePath),
        translationsDir
      );
      if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
      }
      // for each language, create the translation file
      languages.forEach((language) => {
        if (language.disableTranslations) {
          console.info(
            `Translations are disabled for ${language.name || language.code}`
          );
          return;
        }
        const langCode = language.code;
        const translationFileName = `${templateName}.${langCode}.json`;
        const translationFilePath = path.join(distDir, translationFileName);
        if (fs.existsSync(translationFilePath)) {
          console.warn(
            `Translation file already exists ${translationFilePath}`
          );
          return;
        }
        fs.writeFileSync(translationFilePath, JSON.stringify(texts, null, 2));
        console.log(`Translation created ${translationFilePath}`);

        if (subjectRequired && !compileResult.subject) {
          console.warn(
            `Subject is not defined in the template ${templatePath}.`
          );
        }
      });
    })
  );

  // 4. cleanup
  cleanupAll();
}

export default generateTranslations;
