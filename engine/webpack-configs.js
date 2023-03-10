import path from "path";

/**
 * @param {string} entry
 * @param {string=} outputFilename
 * @param {boolean | string | undefined=} sourceMap
 * @returns {import("webpack").Configuration}
 */
function getConfig(entry, outputFilename, sourceMap) {
  return {
    mode: "development",
    entry: entry,
    devtool: sourceMap === false ? false : "source-map",
    target: "node",
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /(node_modules)/,
          use: {
            loader: "swc-loader",
            options: {
              jsc: {
                parser: {
                  syntax: "typescript",
                  tsx: true,
                  dynamicImport: true,
                  numericSeparator: true,
                  optionalChaining: true,
                },
                target: "es2019",
                transform: {
                  react: {
                    pragma: "global.jsx.createElement",
                    pragmaFrag: "global.jsx.createFragment",
                  },
                },
              },
            },
          },
        },
      ],
    },
    resolve: {
      extensions: [".tsx", ".jsx", ".ts", ".js"],
    },
    output: {
      filename: outputFilename || "bundle.js",
      path: path.resolve(process.cwd(), "./dist/.temp"),
    },
  };
}

export default getConfig;
