const path = require("path");

const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");

const Env = require("./constants").Env;

const BASE_PLUGINS = [
    new webpack.DefinePlugin({
        "process.env.USE_JSON_DATASET": JSON.stringify(process.env.USE_JSON_DATASET) || false,
        "process.env.USE_DEV_DB": JSON.stringify(process.env.USE_DEV_DB) || false,
    }),
    new ForkTsCheckerWebpackPlugin({
        typescript: {
            tsconfig: path.resolve(__dirname, "../", "tsconfig.json"),
        },
    }),
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
        patterns: [
            {
                from: path.resolve(__dirname, "../src/data", "cell_feature_analysis.json"),
                to: "data",
            },
            {
                from: path.resolve(__dirname, "../src/data", "feature_defs.json"),
                to: "data",
            },
            {
                from: path.resolve(__dirname, "../src/data", "cell-line-def.json"),
                to: "data",
            },
            {
                from: path.resolve(__dirname, "../src/data", "albums.json"),
                to: "data",
            },
            {
                from: path.resolve(__dirname, "../src/images"),
                to: "images",
            },
        ],
    }),
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
