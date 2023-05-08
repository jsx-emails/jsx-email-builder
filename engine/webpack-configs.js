/**
 * @typedef {import("webpack").Configuration} WebpackConfig
 * @typedef {Object} WebpackConfigParams
 * @property {string} entry
 * @property {string} outputFilename
 * @property {string} outputPath
 * @property {boolean} [sourceMap]
 * @property {Object.<string, string>} [alias]
 * @param {WebpackConfigParams} params
 * @returns {WebpackConfig}
 */

function getConfig(params) {
  const { entry, outputFilename, outputPath, sourceMap, alias = {} } = params;

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
                    throwIfNamespace: false,
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
      alias: {
        // aliases will be get from jsx-email-builder config file and add to webpack at runtime
        ...alias,
      },
    },
    output: {
      filename: outputFilename || "bundle.js",
      path: outputPath,
    },
  };
}

export default getConfig;
