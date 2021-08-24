const path = require("path");
const fs = require("fs");

const lessToJs = require("less-vars-to-js");
const themeVariables = lessToJs(
    fs.readFileSync(path.join(__dirname, "../src/styles/ant-vars.less"), "utf8")
);
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const { devServer, Env, stats } = require("./constants");
const getPluginsByEnv = require("./plugins");

module.exports = ({ analyze, env } = {}) => ({
    devtool: env !== Env.PRODUCTION && "source-map",
    devServer: {
        static: {
            directory: path.join(__dirname, "../", "dist"),
        },
        allowedHosts: "all",
        host: devServer.host,
        port: devServer.port,
    },
    stats: stats,
    entry: {
        app: "./src/index.tsx",
    },
    mode: env === Env.PRODUCTION ? "production" : "development",
    module: {
        rules: [
            {
                test: /\.(ts|js|tsx|jsx)$/,
                include: [
                    path.resolve(__dirname, "../", "src"),
                    path.resolve(__dirname, "../", "../", "volume-viewer"),
                ],
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                },
            },

            // this rule processes any CSS written for this project and contained in src/
            // it applies PostCSS plugins and converts it to CSS Modules
            {
                test: /\.css/,
                include: [path.resolve(__dirname, "../", "src")],
                use: [
                    // {
                    //     loader: "style-loader",
                    // },
                    {
                        loader: MiniCssExtractPlugin.loader,
                    },
                    {
                        loader: "css-loader",
                        options: {
                            esModule: false,
                            modules: {
                                //namedExport: true,
                                localIdentName: "[name]__[local]--[hash:base64:5]",
                                exportLocalsConvention: "camelCase",
                            },
                            importLoaders: 1,
                        },
                    },
                    {
                        loader: "postcss-loader",
                        options: {
                            postcssOptions: {
                                ident: "postcss",
                                plugins: [
                                    require("autoprefixer"),
                                    // require("postcss-flexbugs-fixes"),
                                    // require("postcss-preset-env"),
                                    // {
                                    //     autoprefixer: {
                                    //         flexbox: "no-2009",
                                    //     },
                                    // },
                                ],
                            },
                            sourceMap: env !== Env.PRODUCTION,
                        },
                    },
                ],
            },

            // this rule will handle any css imports out of node_modules; it does not apply PostCSS,
            // nor does it convert the imported css to CSS Modules
            // e.g., importing antd component css
            {
                test: /\.css/,
                include: [
                    path.resolve(__dirname, "../", "../", "website-3d-cell-viewer"), //for local testing
                    path.resolve(__dirname, "../", "node_modules"),
                ],
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                    },
                    {
                        loader: "css-loader",
                    },
                ],
            },
            {
                test: /\.less$/,
                use: [
                    { loader: MiniCssExtractPlugin.loader },
                    {
                        loader: "css-loader",
                        options: {
                            importLoaders: 1,
                            modules: {
                                exportLocalsConvention: "camelCase",
                            },
                        },
                    },
                    {
                        loader: "less-loader",
                        options: {
                            lessOptions: {
                                javascriptEnabled: true,
                                modifyVars: themeVariables,
                                math: "always",
                            },
                        },
                    },
                ],
            },
            {
                test: /\.(png|jpg|gif|svg)$/i,
                type: "asset/resource",
            },
        ],
    },

    optimization: {
        minimize: env === Env.PRODUCTION,
        runtimeChunk: "single",
        splitChunks: {
            chunks: "all",
            cacheGroups: {
                vendor: {
                    filename: "vendor.[contenthash].js",
                    test: /[\\/]node_modules[\\/]/,
                },
            },
        },
    },
    output: {
        path: path.resolve(__dirname, "../", "dist"),
        filename: "[name].[contenthash].js",
    },
    plugins: getPluginsByEnv(env, analyze),
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
        mainFields: ["module", "main", "browser"],
        alias: {
            react: path.resolve("./node_modules/react"),
        },
    },
    stats: analyze ? "none" : stats,
});
