import fs from "fs-extra";
import path from "path";
import parseArgs from "minimist";
import { merge } from "lodash-es";

const args = parseArgs(process.argv.slice(2));

export const DEFAULT_FILTER = "**/*";

export function getConfig() {
  const defaultConfig = getDefaultConfig();
  const configFile = overrideWithConfigFile(defaultConfig);
  const config = overrideWithCliArgs(configFile);

  return config;
}

function getConfigPath() {
  const configDir = args.configDir || "";
  const configPath = path.join(
    process.cwd(),
    configDir,
    "./jsx-email-builder.json",
  );

  return configPath;
}

export const DEST_TYPES = {
  SAME_AS_TEMPLATES_DIR: "SAME_AS_TEMPLATES_DIR",
  ALL_IN_ONE: "ALL_IN_ONE",
  PER_FIRST_LEVEL_DIR: "PER_FIRST_LEVEL_DIR",
};

function getDefaultConfig() {
  return {
    templates: {
      templatesDir: "./email-templates",
      templatesPostfix: ".template.tsx",
      filter: DEFAULT_FILTER,
      templateNameMaxLength: null,
      subjectRequired: true,
      subjectPostfix: "_subject",
      importAliases: {},
    },
    build: {
      destDir: DEST_TYPES.SAME_AS_TEMPLATES_DIR,
    },
    translation: {
      languages: [],
      translationsDir: "./translations",
      createModuleFiles: false,
      keepUnmatchedTranslations: true,
      confirmUnmatchedTranslationsRemoval: true,
      translationKeyAsDefaultValue: false,
      appendNewLineAtTheEndOfTranslationFiles: true,
      commonTranslationsDirs: [],
      onlyDefaultLang: false,
    },
    server: {
      port: 2525,
      httpsEnabled: false,
      httpsKeyPath: null,
      httpsCertPath: null,
      componentsOutsideTemplatesDirPaths: [],
    },
    homePage: {
      ignoreDirsContainingTemplates: false,
    },
  };
}

function overrideWithConfigFile(defaultConfig) {
  const configPath = getConfigPath();

  if (fs.existsSync(configPath)) {
    const configFile = fs.readJsonSync(configPath);
    return merge({}, defaultConfig, configFile);
  }

  console.warn("No config file found. Using default config.");
  return defaultConfig;
}

function overrideWithCliArgs(config) {
  const cliArgs = args;
  const result = merge({}, config);
  Object.keys(config).forEach((parentKey) => {
    Object.keys(config[parentKey]).forEach((configKey) => {
      if (cliArgs[configKey] !== undefined) {
        result[parentKey][configKey] = cliArgs[configKey];
      }
    });
  });

  return result;
}

export default getConfig;
