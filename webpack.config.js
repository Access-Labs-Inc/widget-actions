const path = require("path");
const webpack = require("webpack");
const Dotenv = require("dotenv-webpack");

const CopyPlugin = require("copy-webpack-plugin");
const StatoscopeWebpackPlugin = require("@statoscope/webpack-plugin").default;
const { DuplicatesPlugin } = require("inspectpack/plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CompressionPlugin = require("compression-webpack-plugin");

const bundleOutputDir = "./dist";

module.exports = (env) => {
  console.log("ENVs", env);

  let devtool = "inline-source-map";
  const isDevBuild = env.TARGET_ENV === "development";
  let plugins = [];

  switch (env.TARGET_ENV) {
    case "development":
      plugins = [
        new Dotenv({
          path: path.join(__dirname, ".env.development"),
        }),
        new webpack.ProvidePlugin({
          process: "process/browser",
          Buffer: ["buffer", "Buffer"],
        }),
        new StatoscopeWebpackPlugin(),
        new CopyPlugin([{ from: "html-dev/" }]),
        new MiniCssExtractPlugin({
          filename: "[name].css",
        }),
      ];
      break;
    case "production":
      devtool = false;
      plugins = [
        new Dotenv({
          path: path.join(__dirname, ".env.production"),
          allowEmptyValues: false,
        }),
        new webpack.ProvidePlugin({
          process: "process/browser",
          Buffer: ["buffer", "Buffer"],
        }),
        new StatoscopeWebpackPlugin(),
        new CopyPlugin([{ from: "html-production/" }]),
        new MiniCssExtractPlugin({
          filename: "[name].css",
        }),
        new CompressionPlugin({
          test: /\.(js|css)$/, // Compress .js and .css files
          algorithm: "gzip", // Default compression algorithm
          threshold: 10240, // Only assets bigger than this size (10 Kilobytes) are processed
          minRatio: 0.8 // Only assets that compress better than this ratio are processed
        }),
      ];
      break;
    case "staging":
      devtool = false;
      plugins = [
        new Dotenv({
          path: path.join(__dirname, ".env.staging"),
          allowEmptyValues: false,
        }),
        new webpack.ProvidePlugin({
          process: "process/browser",
          Buffer: ["buffer", "Buffer"],
        }),
        new StatoscopeWebpackPlugin(),
        new CopyPlugin([{ from: "html-staging/" }]),
        new MiniCssExtractPlugin({
          filename: "[name].css",
        }),
        new CompressionPlugin({
          test: /\.(js|css)$/, // Compress .js and .css files
          algorithm: "gzip", // Default compression algorithm
          threshold: 10240, // Only assets bigger than this size (10 Kilobytes) are processed
          minRatio: 0.8 // Only assets that compress better than this ratio are processed
        }),
      ];
      break;
    default:
      throw new Error(`Unsupported TARGET_ENV: ${env.TARGET_ENV}`);
  }

  return [
    {
      entry: "./src/index.ts",
      devtool: devtool,
      output: {
        filename: "widget.js",
        path: path.resolve(bundleOutputDir),
      },
      devServer: {
        port: 3000,
        static: bundleOutputDir,
      },
      plugins: plugins,
      optimization: {
        minimize: !isDevBuild,
      },
      mode: isDevBuild ? "development" : "production",
      module: {
        rules: [
          // packs SVG's discovered in url() into bundle
          { test: /\.svg/, use: "svg-url-loader" },
          {
            test: /\.css$/i,
            use: [
              { loader: MiniCssExtractPlugin.loader },
              {
                loader: "css-loader",
              },
              {
                loader: "postcss-loader",
                options: {
                  postcssOptions: {
                    plugins: [
                      require("autoprefixer")(),
                      require("tailwindcss")(),
                    ],
                  },
                },
              },
            ],
            sideEffects: true,
          },
          // use babel-loader for TS and JS modeles,
          // starting v7 Babel babel-loader can transpile TS into JS,
          // so no need for ts-loader
          // note, that in dev we still use tsc for type checking
          {
            test: /\.(js|ts|tsx|jsx)$/,
            exclude: [/node_modules/, /access-protocol/],
            use: [
              {
                loader: "babel-loader",
                options: {
                  presets: [
                    ["@babel/preset-env"],
                    [
                      // enable transpiling ts => js
                      "@babel/typescript",
                      // tell babel to compile JSX using into Preact
                      { jsxPragma: "h" },
                    ],
                  ],
                  plugins: [
                    // syntax sugar found in React components
                    "@babel/proposal-class-properties",
                    "@babel/proposal-object-rest-spread",
                    // transpile JSX/TSX to JS
                    [
                      "@babel/plugin-transform-react-jsx",
                      {
                        // we use Preact, which has `Preact.h` instead of `React.createElement`
                        pragma: "h",
                        pragmaFrag: "Fragment",
                      },
                    ],
                  ],
                },
              },
            ],
          },
        ],
      },
      resolve: {
        extensions: ["*", ".js", ".ts", ".tsx"],
        alias: {
          react: "preact/compat",
          "react-dom/test-utils": "preact/test-utils",
          "react-dom": "preact/compat", // Must be below test-utils
          "react/jsx-runtime": "preact/jsx-runtime",
        },
        fallback: {
          crypto: require.resolve("crypto-browserify"),
          stream: require.resolve("stream-browserify"),
          path: require.resolve("path-browserify"),
          buffer: require.resolve("buffer"),
          zlib: require.resolve("browserify-zlib"),
          vm: require.resolve("vm-browserify"),
        },
      },
    },
  ];
};
