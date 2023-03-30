import fs from "fs";
import path from "path";
import webpack from "webpack";
import { v4 as uuid } from "uuid";
import url from "url";
import getWebpackConfig from "./webpack-configs.js";
import { setupJsxFactory } from "./jsx-parser.js";
import { setupI18n } from "./i18n.js";
import { setupUtils } from "./utils.js";
import prettier from "prettier";

const currentDir = path.dirname(url.fileURLToPath(import.meta.url));

/**
 * @param {Object} options
 * @param {string} options.templatePath
 * @param {boolean} options.i18nEnabled
 * @param {boolean=} options.compileAllLangs
 * @param {boolean=} options.prettify
 * @param {string=} options.defaultLang
 * @returns {Promise<{ html: string, localized: { [lang: string]: string } }>}
 */
export async function compile(options) {
  const {
    templatePath,
    i18nEnabled = true,
    compileAllLangs = false,
    prettify = false,
    defaultLang = "en",
  } = options;

  const result = { html: "", localized: {} };
  let entryFileName;
  let bundleFileName;
  let html;
  let i18next;
  try {
    // 1. create a temp folder to store the entry file
    createTempDir();

    // 2. create the entry file
    entryFileName = createEntryFile(templatePath);

    // 3. transpile and bundle
    bundleFileName = await TranspileAndBundle(entryFileName);

    // 4. setup the jsx methods
    setupJsxFactory();

    // 5. setup the i18n methods if i18n is enabled
    if (i18nEnabled) {
      i18next = setupI18n({ lng: defaultLang });
    }

    // 6. setup the utils methods
    setupUtils();

    // 7. Run the transpiled code to get html
    html = await runBundle(bundleFileName, prettify);
    result.html = html;

    // 8. if compileAllLangs, run the transpiled code again for each language
    if (i18nEnabled && compileAllLangs && i18next) {
      const languages = Object.keys(i18next.services.resourceStore.data).filter(
        (lang) => lang !== defaultLang
      );
      for (const lang of languages) {
        await i18next.changeLanguage(lang);
        const html = await runBundle(
          bundleFileName + "?lang=" + lang,
          prettify
        );
        result.localized[lang] = html;
      }
    }

    // 9. cleanup
    cleanup({ entryFileName, bundleFileName });
  } catch (error) {
    cleanup({ entryFileName, bundleFileName });
    throw error;
  }

  return result;
}

function createTempDir() {
  try {
    const tempDir = path.join(process.cwd(), "./dist/.temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(path.join(process.cwd(), "./dist/.temp"), {
        recursive: true,
      });
    }
  } catch (error) {
    throw new Error("Error while creating the temp dir:\n" + error.message);
  }
}

function createEntryFile(templatePath) {
  try {
    const entryFileTemplate = path.join(currentDir, "entry.template.js");
    const entryFileName = "entry." + uuid() + ".js";
    const entryFile = path.join(process.cwd(), "./dist/.temp/", entryFileName);
    const entryFileTemplateContent = fs.readFileSync(entryFileTemplate, "utf8");
    const entryFileContent = entryFileTemplateContent.replace(
      /{{templatePath}}/g,
      templatePath
    );
    fs.writeFileSync(entryFile, entryFileContent);

    return entryFileName;
  } catch (error) {
    throw new Error("Error while creating the entry file:\n" + error.message);
  }
}

/**
 * @param {string} entryFileName
 * @returns {Promise<string>}
 */
async function TranspileAndBundle(entryFileName) {
  try {
    const bundleFileName = "bundle." + uuid() + ".js";
    const outputPath = path.join(process.cwd(), "./dist/.temp/");
    const entryFile = path.join(process.cwd(), "./dist/.temp/", entryFileName);
    const webpackConfigs = getWebpackConfig({
      entry: entryFile,
      outputFilename: bundleFileName,
      sourceMap: false,
      outputPath,
    });
    const bundlePromise = new Promise((resolve, reject) => {
      webpack(webpackConfigs, (err, stats) => {
        if (err || stats?.hasErrors()) {
          console.error(err || stats?.compilation.errors);
          reject(err || new Error(stats?.compilation.errors.join("")));
        } else {
          console.log("Bundle created successfully!");
          resolve(stats);
        }
      });
    });
    await bundlePromise;

    return bundleFileName;
  } catch (error) {
    throw new Error("Error while bundling the code:\n" + error.message);
  }
}

async function runBundle(bundleFileName, prettify = false) {
  try {
    const jsFilePath = path.join(
      process.cwd(),
      `./dist/.temp/${bundleFileName}`
    );
    await import(jsFilePath);
    const html = `<!DOCTYPE html>${global.jsx.output.outerHTML}`;

    if (prettify) {
      return prettier.format(html, { parser: "html" });
    }
    return html;
  } catch (error) {
    throw new Error("Error while running the bundle:\n" + error.message);
  }
}

/**
 * @param {Object} params
 * @param {string | undefined} params.entryFileName
 * @param {string | undefined} params.bundleFileName
 * @param {boolean=} params.sourceMap
 * @returns {void}
 * */
export function cleanup(params) {
  const { entryFileName, bundleFileName, sourceMap = true } = params;
  const tempDir = path.join(process.cwd(), "./dist/.temp");
  const entryFileSourceMap = entryFileName + ".map";
  const filesToDelete = [
    entryFileName,
    bundleFileName,
    sourceMap && entryFileSourceMap,
  ];

  for (const file of filesToDelete) {
    if (file) {
      fs.rmSync(path.join(tempDir, file), { force: true });
    }
  }
}

export function cleanupAll() {
  const tempDir = path.join(process.cwd(), "./dist/.temp");
  fs.rmSync(tempDir, { recursive: true });
}
