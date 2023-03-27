import fs from "fs-extra";
import path from "path";
import url from "url";

export function initializeNewProject(params) {
  const currentDir = path.dirname(url.fileURLToPath(import.meta.url));
  const projectTemplateDir = path.join(currentDir, "../new-project-template");
  const emailTemplatesDir = path.join(projectTemplateDir, "email-templates");
  const projectName = params._[1];
  const targetRootDir = path.join(
    process.cwd(),
    params.projectDir || "",
    projectName
  );
  const targetTemplatesDir = path.join(
    targetRootDir,
    params.templatesDir || "email-templates"
  );

  // If the target directory already exists, throw an error
  if (fs.existsSync(targetRootDir)) {
    console.error(
      `[JSX-Email-Builder] error: The directory ${targetRootDir} already exists. You may already have run this command.`
    );
    return;
  }

  // Copy email templates
  fs.ensureDirSync(targetTemplatesDir);
  fs.copySync(emailTemplatesDir, targetTemplatesDir);

  // Copy jsx-email-builder config
  const configPath = path.join(projectTemplateDir, "jsx-email-builder.json");
  const targetConfigPath = path.join(targetRootDir, "jsx-email-builder.json");
  fs.copySync(configPath, targetConfigPath);
  if (params.templatesDir) {
    const config = fs.readJsonSync(targetConfigPath);
    config.templatesDir = params.templatesDir;
    fs.writeJsonSync(targetConfigPath, config, { spaces: 2 });
  }

  // Copy package.json
  const packageJsonPath = path.join(projectTemplateDir, "package.json");
  const targetPackageJsonPath = path.join(targetRootDir, "package.json");
  fs.copySync(packageJsonPath, targetPackageJsonPath);
  if (projectName) {
    const packageJson = fs.readJsonSync(targetPackageJsonPath);
    packageJson.name = projectName;
    fs.writeJsonSync(targetPackageJsonPath, packageJson, { spaces: 2 });
  }

  // Copy tsconfig.json
  const tsconfigPath = path.join(projectTemplateDir, "tsconfig.json");
  const targetTsconfigPath = path.join(targetRootDir, "tsconfig.json");
  fs.copySync(tsconfigPath, targetTsconfigPath);

  // Copy types.d.ts
  const typesPath = path.join(projectTemplateDir, "types.d.ts");
  const targetTypesPath = path.join(targetRootDir, "types.d.ts");
  fs.copySync(typesPath, targetTypesPath);

  // Copy .gitignore
  const gitignorePath = path.join(projectTemplateDir, ".gitignore.template");
  const targetGitignorePath = path.join(targetRootDir, ".gitignore");
  fs.copySync(gitignorePath, targetGitignorePath);

  console.log("[JSX-Email-Builder] Done!");
}
