const config = {
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  extends: ["eslint:recommended", "prettier"],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["jsdoc", "prettier"],
  rules: {
    "prettier/prettier": ["error"],
    "jsdoc/no-undefined-types": ["error"],
    quotes: ["error", "double"],
    semi: ["error", "always"],
  },
  overrides: [
    {
      files: ["*.cjs"],
      env: {
        node: true,
      },
      parserOptions: {
        sourceType: "script",
      },
    },
  ],
};

module.exports = config;
