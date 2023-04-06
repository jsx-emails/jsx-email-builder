import fs from "fs-extra";
import path from "path";
import prettier from "prettier";
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
  const createModuleFiles =
    params.createModuleFiles || config.createModuleFiles || false;

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
  for (const templateRelativePath of templates) {
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
    if (Object.keys(texts).length === 0) {
      console.warn(`No texts for translation found in ${templatePath}`);
      return;
    }
    const translationFileContent = JSON.stringify(texts, null, 2);

    // if translations directory doesn't exist, create it
    const templateName = path.basename(templatePath, templatesPostFix);
    const distDir = path.join(
      process.cwd(),
      templatesDir,
      path.dirname(templateRelativePath),
      translationsDir
    );
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }

    // for each language, create the translation file
    languages.forEach((language) => {
      if (language.disableTranslations) {
        if (!language.default) {
          console.info(
            `Translations are disabled for ${language.name || language.code}`
          );
        }
        return;
      }
      const langCode = language.code;
      const translationFileName = `${templateName}.${langCode}.json`;
      const translationFilePath = path.join(distDir, translationFileName);
      if (fs.existsSync(translationFilePath)) {
        console.warn(`Translation file already exists ${translationFilePath}`);
        return;
      }
      fs.writeFileSync(translationFilePath, translationFileContent);
      console.log(`Translation created ${translationFilePath}`);

      if (subjectRequired && !compileResult.subject) {
        console.warn(`Subject is not defined in the template ${templatePath}.`);
      }
    });

    // 4. create the module file
    if (createModuleFiles) {
      generateModuleFiles({
        distDir,
        templateName,
        languages,
      });
    }
  }

  // 5. cleanup
  cleanupAll();
}

/**
 * Generates the ts module file for the translations that imports all the translation files and exports them as a single object
 * @param {object} params
 * @param {string} params.distDir
 * @param {string} params.templateName
 * @param {object[]} params.languages
 * @param {string} params.languages[].code
 * @param {string} params.languages[].name
 * @param {boolean} params.languages[].default
 * @param {boolean} params.languages[].disableTranslations
 */
function generateModuleFiles(params) {
  const { distDir, templateName, languages } = params;
  const moduleFileName = `${templateName}.ts`;
  const moduleFilePath = path.join(distDir, moduleFileName);

  // add the import statements
  let moduleFileContent = languages
    .map((language) => {
      if (language.disableTranslations) {
        return;
      }
      const langCode = language.code;
      const translationFileName = `${templateName}.${langCode}.json`;
      const langCodeAsVariable = langCode.replace(/-([a-z])/g, (g) =>
        g[1].toUpperCase()
      );
      return `import ${langCodeAsVariable} from "./${translationFileName}";`;
    })
    .join("\n")
    .concat("\n\n");

  // add the export statement
  moduleFileContent = moduleFileContent.concat(
    `export default {
        ${languages
          .map((language) => {
            if (language.disableTranslations) {
              return;
            }
            const langCode = language.code;
            const langCodeAsVariable = langCode.replace(/-([a-z])/g, (g) =>
              g[1].toUpperCase()
            );
            return `${langCodeAsVariable},`;
          })
          .join("\n")}\n} as TranslationGroup;\n`
  );

  // format the file
  moduleFileContent = prettier.format(moduleFileContent, {
    parser: "typescript",
  });

  // write the file
  fs.writeFileSync(moduleFilePath, moduleFileContent);
}

export default generateTranslations;
