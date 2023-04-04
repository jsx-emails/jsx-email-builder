import fs from "fs-extra";
import path from "path";
import { getConfig } from "./config";

export async function createSubjectTemplate(params) {
  const { templateDir, emailTemplateName, subject } = params;

  const subjectPostfix = getConfig().subjectPostfix || "_subject";
  const subjectTemplatePath = path.join(
    templateDir,
    emailTemplateName + subjectPostfix + ".html"
  );

  fs.ensureDirSync(path.dirname(subjectTemplatePath));
  fs.writeFileSync(subjectTemplatePath, subject);
}

export default createSubjectTemplate;
