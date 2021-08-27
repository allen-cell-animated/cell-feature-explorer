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
        // devserver fails to get the right hash for the webworker
        // but running in a static python webserver gets the correct hash after running a manual build
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
                include: [path.resolve(__dirname, "../", "src")],
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
                    {
                        loader: MiniCssExtractPlugin.loader,
                    },
                    {
                        loader: "css-loader",
                        options: {
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
                                plugins: [require("autoprefixer")],
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
                include: [path.resolve(__dirname, "../", "node_modules")],
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
                // treat less files from node_modules without any css module mangling
                // i.e. no options in css-loader because we figure they are already
                test: /\.less$/,
                include: [path.resolve(__dirname, "../", "node_modules")],
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                    },
                    {
                        loader: "css-loader",
                        options: {
                            importLoaders: 1,
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
        symlinks: false,
        extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
        mainFields: ["module", "main", "browser"],
        // Removing this works when removing react from node_modules of the deps volume-viewer and website-3d-cell-viewer
        // do env check? this is needed for local testing of dependencies that have react
        // alias: {
        //     react: path.resolve("./node_modules/react"),
        // },
    },
    stats: analyze ? "none" : stats,
});
