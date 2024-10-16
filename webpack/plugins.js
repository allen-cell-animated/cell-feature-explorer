const path = require("path");

const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");

const Env = require("./constants").Env;

const BASE_PLUGINS = [
    new webpack.DefinePlugin({
        "process.env.USE_JSON_DATASET": JSON.stringify(process.env.USE_JSON_DATASET) || false,
        "process.env.USE_DEV_DB": JSON.stringify(process.env.USE_DEV_DB) || false,
        "process.env.USE_REDUX_DEVTOOLS": JSON.stringify(process.env.USE_REDUX_DEVTOOLS) || false,
    }),
    new ForkTsCheckerWebpackPlugin({
        typescript: {
            tsconfig: path.resolve(__dirname, "../", "tsconfig.json"),
        },
    }),
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
        filename: "style.[contenthash].css",
    }),
    new HtmlWebpackPlugin({
        template: path.resolve(__dirname, "index.template.html"),
    }),
];

const BUNDLE_ANALYZER = [new BundleAnalyzerPlugin({ analyzerMode: "static" })];

const PLUGINS_BY_ENV = {
    [Env.PRODUCTION]: [
        new webpack.DefinePlugin({
            "process.env.NODE_ENV": JSON.stringify("production"),
        }),
    ],
    [Env.STAGE]: [
        new webpack.DefinePlugin({
            "process.env.NODE_ENV": JSON.stringify("staging"),
        }),
    ],
    [Env.DEVELOPMENT]: [
        new webpack.DefinePlugin({
            "process.env.NODE_ENV": JSON.stringify("development"),
        }),
    ],
};

module.exports = (env, analyzer) => [
    ...BASE_PLUGINS,
    ...(analyzer ? BUNDLE_ANALYZER : []),
    ...(PLUGINS_BY_ENV[env] || []),
];
