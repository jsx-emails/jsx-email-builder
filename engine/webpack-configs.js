/**
 * @typedef {Object} WebpackConfigParams
 * @property {string} entry
 * @property {string} outputFilename
 * @property {string} outputPath
 * @property {boolean} [sourceMap]
 * @param {WebpackConfigParams} params
 * @returns {import("webpack").Configuration}
 */
function getConfig(params) {
  const { entry, outputFilename, outputPath, sourceMap } = params;

  return {
    mode: "development",
    entry: entry,
    devtool: sourceMap === false ? false : "source-map",
    target: "node",
    module: {
      rules: [
        {
          test: /\.tsx?$/,
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
      path: outputPath,
    },
  };
}

export default getConfig;
