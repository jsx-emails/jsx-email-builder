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
import getConfig from "./config.js";

const currentDir = path.dirname(url.fileURLToPath(import.meta.url));

/**
 * @param {Object} options
 * @param {string} options.templatePath
 * @param {boolean} options.i18nEnabled
 * @param {boolean=} options.compileAllLangs
 * @param {boolean=} options.prettify
 * @param {string=} options.defaultLang
 * @param {Function=} options.transCallback
 * @returns {Promise<{ html: string, subject: string, localized: { [lang: string]: {html: string, subject: string} } }>}
 */
export async function compile(options) {
  const {
    templatePath,
    i18nEnabled = true,
    compileAllLangs = false,
    prettify = false,
    defaultLang = "en",
    transCallback,
  } = options;

  const result = { html: "", subject: "", localized: {} };
  let entryFileName;
  let bundleFileName;
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
      i18next = setupI18n({ lng: defaultLang, transCallback });
    }

    // 6. setup the utils methods
    setupUtils();

    // 7. Run the transpiled code to get html and subject
    const { html, subject } = await runBundle(bundleFileName, prettify);
    result.html = html;
    result.subject = subject;

    // 8. if compileAllLangs, run the transpiled code again for each language
    if (i18nEnabled && compileAllLangs && i18next) {
      const languages = Object.keys(i18next.services.resourceStore.data).filter(
        (lang) => lang !== defaultLang
      );
      for (const lang of languages) {
        await i18next.changeLanguage(lang);
        const { html, subject } = await runBundle(
          bundleFileName + "?lang=" + lang,
          prettify
        );
        result.localized[lang] = { html, subject };
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
    throw {
      ...error,
      message: "Error while creating the temp dir:\n" + error.message,
    };
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
    throw {
      ...error,
      message: "Error while creating the entry file:\n" + error.message,
    };
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
    const {
      templates: { importAliases },
    } = getConfig();
    const webpackConfigs = getWebpackConfig({
      entry: entryFile,
      outputFilename: bundleFileName,
      sourceMap: false,
      outputPath,
      alias: importAliases,
    });
    const bundlePromise = new Promise((resolve, reject) => {
      webpack(webpackConfigs, (err, stats) => {
        if (err || stats?.hasErrors()) {
          console.error(err || stats?.compilation.errors);
          reject(err || new Error(stats?.compilation.errors.join("")));
        } else {
          // todo: log if debug is true: console.log("Bundle created successfully!");
          resolve(stats);
        }
      });
    });
    await bundlePromise;

    return bundleFileName;
  } catch (error) {
    throw {
      ...error,
      message: "Error while bundling the code:\n" + error.message,
    };
  }
}

/**
 * @param {string} bundleFileName
 * @param {boolean=} prettify
 * @returns {Promise<{ html: string, subject: string }>}
 * */
async function runBundle(bundleFileName, prettify = false) {
  try {
    const jsFilePath = path.join(
      process.cwd(),
      `./dist/.temp/${bundleFileName}`
    );

    await import(jsFilePath);

    const subject = global.outputs?.subject;
    const doctype = global.jsx.doctype || "<!DOCTYPE html>";
    const { document } = global.jsx.dom.window;

    // set subject as title of the html:
    if (subject && global.jsx.output.html) {
      const title = global.jsx.output.html.querySelector("title");
      if (title) {
        title.innerHTML = subject;
      } else {
        const head = global.jsx.output.html.querySelector("head");
        if (head) {
          const title = document.createElement("title");
          title.innerHTML = subject;
          head.appendChild(title);
        }
      }
    }

    // if any internal styles, add them to the head
    if (global.outputs?.internalStyles.size && global.jsx.output.html) {
      const head = global.jsx.output.html.querySelector("head");
      if (head) {
        const style = document.createElement("style");
        style.setAttribute("type", "text/css");
        style.innerHTML = Array.from(global.outputs.internalStyles).join("\n");
        head.appendChild(style);
      }
    }

    const html = `${doctype}\n${global.jsx.output.html.outerHTML}`;

    if (prettify) {
      return {
        html: prettier.format(html, { parser: "html", printWidth: 5000 }),
        subject,
      };
    }
    return { html, subject };
  } catch (error) {
    throw {
      ...error,
      message: "Error while running the bundle:\n" + error.message,
    };
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
  const debug = false; // todo: make this configurable
  if (debug) {
    return;
  }
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
  const debug = false; // todo: make this configurable
  if (debug) {
    return;
  }
  const tempDir = path.join(process.cwd(), "./dist/.temp");
  fs.rmSync(tempDir, { recursive: true });
}
