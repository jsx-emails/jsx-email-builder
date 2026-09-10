import js from "@eslint/js";
import prettierConfig from "eslint-config-prettier";
import jsdoc from "eslint-plugin-jsdoc";
import prettier from "eslint-plugin-prettier";
import globals from "globals";

export default [
  {
    ignores: [".history/**", "dist/**", "dist-backup/**", "node_modules/**"],
  },
  js.configs.recommended,
  {
    files: ["**/*.{js,cjs,mjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      jsdoc,
      prettier,
    },
    rules: {
      ...prettierConfig.rules,
      "jsdoc/no-undefined-types": "error",
      "jsdoc/no-unnecessary-type-assertion": "off",
      "prettier/prettier": "warn",
      quotes: ["error", "double"],
      semi: ["error", "always"],
    },
  },
  {
    files: ["**/*.cjs"],
    languageOptions: {
      sourceType: "commonjs",
    },
  },
];
