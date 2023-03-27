import i18next from "i18next";

export function setupI18n(params) {
  const { lng = "en" } = params;
  i18next.init({
    lng,
    debug: true,
    resources: {
      en: {
        translation: {},
      },
    },
  });

  global.trans = trans;
  global.addTrans = addTrans;
}

function trans(...params) {
  return i18next.t.apply(null, params);
}

function addTrans(resources) {
  Object.keys(resources).forEach((lang) => {
    i18next.addResourceBundle(lang, "translation", resources[lang]);
  });
}
