import fs from "fs-extra";
import path from "path";

export async function createSubjectTemplate(params) {
  const { templateDir, emailTemplateName, subject } = params;

  const subjectTemplatePath = path.join(
    templateDir,
    emailTemplateName + "_Subject.html" // todo: make it configurable
  );

  fs.ensureDirSync(path.dirname(subjectTemplatePath));
  fs.writeFileSync(subjectTemplatePath, subject);
}

export default createSubjectTemplate;
