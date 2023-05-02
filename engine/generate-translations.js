import fs from "fs-extra";
import path from "path";
import prettier from "prettier";
import { getEmailTemplatesList } from "./template-finder.js";
import { compile, cleanupAll } from "./compiler.js";
import { getConfig } from "./config.js";
import chalk from "chalk";
import { omit } from "lodash-es";

async function generateTranslations() {
  const {
    templates: { templatesDir, templatesPostfix, subjectRequired },
    translation: {
      languages,
      translationsDir,
      commonTranslationsDirs,
      createModuleFiles,
      translationKeyAsDefaultValue,
      keepUnmatchedTranslations,
      confirmUnmatchedTranslationsRemoval,
      appendNewLineAtTheEndOfTranslationFiles,
    },
  } = getConfig();

  if (languages.length === 0) {
    console.error(
      chalk.red.bold("Error: No languages specified. \n"),
      "Hint: Please specify the languages in the config file or pass them as a parameter"
    );
    process.exit(1);
  }

  const languagesToTranslate = languages.filter(
    (language) => !language.disableTranslations
  );
  if (languagesToTranslate.length === 0) {
    console.info(
      chalk.yellow.bold("Translations are disabled for all languages.")
    );
    return;
  }

  if (!keepUnmatchedTranslations && confirmUnmatchedTranslationsRemoval) {
    console.warn(
      chalk.yellow.bold("Warning: "),
      "If you have existing translation files, they will be overwritten.",
      "Do you want to continue? (y/n)"
    );
    const answer = await new Promise((resolve) => {
      process.stdin.once("data", (data) => {
        resolve(data.toString().trim().toLowerCase());
      });
    });
    process.stdin.pause();
    if (answer !== "y" && answer !== "yes") {
      console.log(chalk.yellow.bold("Aborted."));
      process.exit(0);
    }
  }

  // 1. get all the templates
  const templates = getEmailTemplatesList();

  // TODO: parallelize this:
  // 2. compile them to get the texts
  for (const templateRelativePath of templates) {
    console.log(
      chalk.magenta.bold("Processing template: "),
      chalk.bold(templateRelativePath)
    );
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
        texts[text] = translationKeyAsDefaultValue ? text : "";
        return text;
      },
    });

    // 3. generate and update the translation files
    if (Object.keys(texts).length === 0) {
      console.warn(chalk.yellow.bold("No texts for translation found!"));
      return;
    }

    if (subjectRequired && !compileResult.subject) {
      console.error(chalk.red.bold("Subject is not defined for the template"));
      process.exit(1);
    }

    // if common translations directories are specified, get the common translations
    const commonTranslations = {};
    if (commonTranslationsDirs.length > 0) {
      for (const commonTranslationsDir of commonTranslationsDirs) {
        const commonTranslationsDirPath = path.join(
          process.cwd(),
          commonTranslationsDir
        );
        if (fs.existsSync(commonTranslationsDirPath)) {
          const commonTranslationsFile = fs
            .readdirSync(commonTranslationsDirPath)
            .find((file) => path.extname(file) === ".json");
          if (!commonTranslationsFile) {
            console.warn(
              chalk.yellow.bold("Warning:"),
              `No translation file found in '${commonTranslationsDirPath}' while looking for common translations.`
            );
            continue;
          }
          const commonTranslationsFilePath = path.join(
            commonTranslationsDirPath,
            commonTranslationsFile
          );
          const commonTranslationsFileContent = fs.readFileSync(
            commonTranslationsFilePath,
            "utf8"
          );
          const commonTranslationsFileContentParsed = JSON.parse(
            commonTranslationsFileContent
          );
          Object.keys(commonTranslationsFileContentParsed).forEach((key) => {
            commonTranslations[key] = true;
          });
        }
      }
    }
    const commonTranslationsKeys = Object.keys(commonTranslations);
    const textsWithoutCommonTranslations = omit(texts, commonTranslationsKeys);

    // if translations directory doesn't exist, create it
    const templateName = path.basename(templatePath, templatesPostfix);
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
            `Info: Translations are disabled for ${
              language.name || language.code
            }`
          );
        }
        return;
      }
      const langCode = language.code;
      const translationFileName = `${templateName}.${langCode}.json`;
      const translationFilePath = path.join(distDir, translationFileName);

      // if the translation file exists, update it
      if (fs.existsSync(translationFilePath)) {
        const existingTranslationFileContent = fs.readFileSync(
          translationFilePath,
          "utf8"
        );
        const existingTranslations = JSON.parse(existingTranslationFileContent);
        const newTranslations = {};
        Object.keys(textsWithoutCommonTranslations).forEach((key) => {
          newTranslations[key] = existingTranslations[key] || "";
        });
        if (keepUnmatchedTranslations) {
          const unmatchedTranslations = omit(
            existingTranslations,
            Object.keys(textsWithoutCommonTranslations)
          );
          Object.keys(unmatchedTranslations).forEach((key) => {
            newTranslations[key] = existingTranslations[key];
          });
        }
        let translationFileContent = JSON.stringify(newTranslations, null, 2);
        translationFileContent = appendNewLineAtTheEndOfTranslationFiles
          ? translationFileContent.concat("\n")
          : translationFileContent;

        // if the translation file is in sync, skip it
        if (translationFileContent === existingTranslationFileContent) {
          console.info("Info: Translation file already in sync for ", langCode);
          return;
        }
        // update the translation file
        fs.writeFileSync(translationFilePath, translationFileContent);
        console.log(chalk.green.bold("Translation file updated."));
        return;
      }

      // if the translation file doesn't exist, create it
      let translationFileContent =
        JSON.stringify(textsWithoutCommonTranslations, null, 2) + "\n";
      translationFileContent = appendNewLineAtTheEndOfTranslationFiles
        ? translationFileContent.concat("\n")
        : translationFileContent;
      fs.writeFileSync(translationFilePath, translationFileContent);
      console.log(
        chalk.green.bold("Translation file created: "),
        translationFilePath
      );
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

  // if the module file exists, and it's the same as the one we want to write, do nothing
  if (fs.existsSync(moduleFilePath)) {
    const existingModuleFileContent = fs.readFileSync(moduleFilePath, "utf8");
    if (existingModuleFileContent === moduleFileContent) {
      console.info("Info: Module file already in sync.");
      return;
    }
  }

  // write the file
  fs.writeFileSync(moduleFilePath, moduleFileContent);
  console.log(chalk.green.bold("Module created: "), moduleFilePath);
}

export default generateTranslations;
