import i18next from "i18next";

export function setupI18n(params) {
  const { lng = "en", transCallback } = params;
  i18next.init({
    lng,
    debug: false,
    resources: {
      en: {
        translation: {},
      },
    },
  });

  global.trans = (...params) => {
    if (transCallback) {
      return transCallback?.(trans(...params));
    }
    return trans(...params);
  };
  global.addTrans = addTrans;

  return i18next;
}

function trans(...params) {
  const defaultLang = "en"; // todo: make it configurable
  const translateDefaultLang = false; // todo: make it configurable
  const currentLang = i18next.language;
  if (currentLang === defaultLang && !translateDefaultLang) {
    const key = params[0];
    return key;
  }

  return i18next.t.apply(null, params);
}

function addTrans(resources) {
  Object.keys(resources).forEach((lang) => {
    const normalizedLang = lang.replace(/([A-Z])/g, "-$1").toLowerCase();
    i18next.addResourceBundle(normalizedLang, "translation", resources[lang]);
  });
}

export const TRANSLATABLE_TAGS = [
  "P",
  "DIV",
  "SPAN",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "LI",
  "TD",
  "TH",
  "LABEL",
  "BUTTON",
  "BODY",
  "MAIN",
  "SECTION",
  "ARTICLE",
  "ASIDE",
  "NAV",
  "DD",
  "DL",
  "DT",
];
