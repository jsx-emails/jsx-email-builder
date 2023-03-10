import fs from "fs";
import path from "path";
import webpack from "webpack";
import getWebpackConfig from "./webpack-configs.js";
import { setupJsxFactory } from "./jsx-factory.js";
import { v4 as uuid } from "uuid";

/**
 * @param {Object} options
 * @param {string} options.templatePath
 */
export async function compile(options) {
  const { templatePath } = options;

  // 1. create a temp folder to store the entry file
  createTempDir();

  // 2. create the entry file
  const entryFile = createEntryFile(templatePath);

  // 3. transpile and bundle
  const bundleFileName = await TranspileAndBundle(entryFile);

  // 4. setup the jsx methods
  setupJsxFactory();

  // 5. Run the transpiled code to get html
  const html = await runBundle(bundleFileName);

  return html;
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
    const entryFileTemplate = path.join(
      process.cwd(),
      "./engine/entry.js.template"
    );
    const entryFile = path.join(
      process.cwd(),
      "./dist/.temp/entry." + uuid() + ".js"
    );
    const entryFileTemplateContent = fs.readFileSync(entryFileTemplate, "utf8");
    const entryFileContent = entryFileTemplateContent.replace(
      /{{templatePath}}/g,
      templatePath
    );
    fs.writeFileSync(entryFile, entryFileContent);

    return entryFile;
  } catch (error) {
    throw new Error("Error while creating the entry file:\n" + error.message);
  }
}

async function TranspileAndBundle(entryFile) {
  try {
    const bundleFileName = "bundle." + uuid() + ".js";
    const webpackConfigs = getWebpackConfig(entryFile, bundleFileName);
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

async function runBundle(bundleFileName) {
  try {
    const jsFilePath = path.join(
      process.cwd(),
      `./dist/.temp/${bundleFileName}?` + Date.now().valueOf()
    );
    await import(jsFilePath);
    const html = `<!DOCTYPE html>${global.jsx.output.outerHTML}`;

    return html;
  } catch (error) {
    throw new Error("Error while running the bundle:\n" + error.message);
  }
}

export function cleanup() {
  fs.rmSync(path.join(process.cwd(), "./dist/.temp"), { recursive: true });
}
