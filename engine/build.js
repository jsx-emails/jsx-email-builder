import fs from "fs";
import path from "path";
import { getEmailTemplatesList } from "./template-finder.js";
import { compile, cleanup } from "./compiler.js";

async function build(params) {
  const templatesDir = params.templatesDir || "./email-templates";
  const templatesPostFix = params.templatesPostFix || ".template.tsx";

  // 1. get all the templates
  const templates = getEmailTemplatesList({
    templatesDir,
    templatesPostFix,
  });

  // 2. compile them in 8 parallel threads
  const promises = templates.map((templateRelativePath) => {
    const templatePath = path.join(
      process.cwd(),
      templatesDir,
      templateRelativePath
    );
    return compile({
      templatePath,
    });
  });
  const results = await Promise.all(promises);

  // 3. write the results to the dist folder
  results.forEach((html, index) => {
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
    fs.writeFileSync(htmlAbsolutePath, html);
  });

  // 4. cleanup
  cleanup();
}

export default build;
