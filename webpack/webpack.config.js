const path = require('path');
const fs  = require('fs');

const lessToJs = require('less-vars-to-js');
const themeVariables = lessToJs(fs.readFileSync(path.join(__dirname, '../src/styles/ant-vars.less'), 'utf8'));
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const tsImportPluginFactory = require('ts-import-plugin');

const {
    devServer,
    Env,
    stats,
} = require('./constants');
const getPluginsByEnv = require('./plugins');

module.exports = ({ analyze, env } = {}) => ({
    devtool: env !== Env.PRODUCTION && 'source-map',
    devServer: {
        contentBase: path.join(__dirname, '../', 'dist'),
        disableHostCheck: true,
        host: devServer.host,
        port: devServer.port,
        publicPath: `${devServer.host}:${devServer.port}:/${devServer.path}/`,
        stats,
    },
    entry: {
        app: './src/index.tsx'
    },
    module: {
        rules: [
            {
                test: /\.tsx?/,
                include: [
                    path.resolve(__dirname, '../', 'src')
                ],
                exclude: /node_modules/,
                use: {
                    loader: 'ts-loader',
                    options: {
                        configFile: path.resolve(__dirname, '../', 'tsconfig.json'),
                        compilerOptions: {
                            noEmit: false,
                        },
                        getCustomTransformers: () => ({
                            before: [
                                tsImportPluginFactory([
                                    {
                                        libraryName: 'lodash',
                                        libraryDirectory: null,
                                        camel2DashComponentName: false,
                                        style: false,
                                    },
                                    {
                                        libraryName: 'antd',
                                        style: true,
                                    }
                                ]),
                            ]
                        }),
                        // give responsibility of type checking to fork-ts-checker-webpack-plugin
                        // in order to speed up build times
                        transpileOnly: true,
                    },
                }
            },

            // this rule processes any CSS written for this project and contained in src/
            // it applies PostCSS plugins and converts it to CSS Modules
            {
                test: /\.css/,
                include: [
                    path.resolve(__dirname, '../', 'src')
                ],
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        {
                            loader: 'css-loader',
                            options: {
                                camelCase: true,
                                importLoaders: 1,
                                localIdentName: '[name]__[local]--[hash:base64:5]',
                                modules: true
                            }
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                ident: 'postcss',
                                plugins: [
                                    require('postcss-import'),
                                    require('postcss-cssnext')(),
                                ]
                            }
                        }
                    ]
                })
            },

            // this rule will handle any css imports out of node_modules; it does not apply PostCSS,
            // nor does it convert the imported css to CSS Modules
            // e.g., importing antd component css
            {
                test: /\.css/,
                include: [
                    path.resolve(__dirname, '../', 'node_modules')
                ],
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [{ loader: 'css-loader' }],
                }),
            },
            {
                loader: 'babel-loader',
                exclude: /node_modules/,
                test: /\.js$/,
                options: {
                    plugins: [
                        ['import', { libraryName: "antd", style: true }]
                    ]
                },
            },
            {
                test: /\.less$/,
                use: ExtractTextPlugin.extract({
                    use: [
                        {
                            loader: "css-loader",
                            options: {
                                camelCase: true,
                                importLoaders: 1
                            }

                        },
                        {
                            loader: "less-loader",
                            options: {
                                javascriptEnabled: true,
                                modifyVars: themeVariables,

                            }
                        }
                    ]
                })
            },
        ]
    },
    output: {
        path: path.resolve(__dirname, '../', 'dist'),
        filename: '[name].[chunkhash].js'
    },
    plugins: getPluginsByEnv(env, analyze),
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json']
    },
    stats: analyze ? "none" : stats,
});
