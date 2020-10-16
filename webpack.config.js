const path = require("path");

module.exports = {
  entry: "./src/index.ts",
  target: "node",
  output: {
    filename: "index.js",
    path: `${__dirname}/dist`,
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js", ".json"],
  },
};
