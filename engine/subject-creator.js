import fs from "fs-extra";
import path from "path";
import { getConfig } from "./config.js";

export async function createSubjectTemplate(params) {
  const { templateDir, emailTemplateName, subject } = params;
  const {
    templates: { subjectPostfix },
  } = getConfig();

  const subjectTemplatePath = path.join(
    templateDir,
    emailTemplateName + subjectPostfix + ".html"
  );

  fs.ensureDirSync(path.dirname(subjectTemplatePath));
  fs.writeFileSync(subjectTemplatePath, subject);
}

export default createSubjectTemplate;
