import path from "path";
import url from "url";
import fs from "fs-extra";
import { execSync } from "child_process";

function runNpmInit(params) {
  const projectDir = path.join(
    process.cwd(),
    params.projectDir || params._[1] || ""
  );
  fs.ensureDirSync(projectDir);
  process.chdir(projectDir);
  execSync("npm init -y", { stdio: "inherit" });
}

function copyTemplateFiles(params) {
  const currentDir = path.dirname(url.fileURLToPath(import.meta.url));
  const projectDir = path.join(process.cwd(), params.projectDir || "");
  fs.ensureDirSync(projectDir);
  const templatesDir = path.join(currentDir, "../email-templates");
  const targetDir = path.join(
    projectDir,
    params.templatesDir || "email-templates"
  );
  fs.copySync(templatesDir, targetDir);
}

function initializeNewProject(params) {
  runNpmInit(params);
  copyTemplateFiles(params);
  console.log("[JSX-Email-Builder] Done!");
}

export default initializeNewProject;
