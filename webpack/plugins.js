const path = require('path');

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

const Env = require('./constants').Env;

const DevServers = require('./server-urls-dev.json');
const ProductionServers = require('./server-urls-production.json');
const StagingServers = require('./server-urls-staging.json');

const BASE_PLUGINS = [
    new ForkTsCheckerWebpackPlugin({
        tsconfig: path.resolve(__dirname, '../', 'tsconfig.json'),
        tslint: path.resolve(__dirname, '../', 'tslint.json'),
        workers: ForkTsCheckerWebpackPlugin.TWO_CPUS_FREE,
    }),
    new CleanWebpackPlugin(['dist'], {
        root: path.resolve(__dirname, '../'),
        watch: true,
    }),
    new CopyWebpackPlugin(
        [
            {
                from: path.resolve(__dirname, '../src/data', 'cell-feature-analysis.json'),
                to: 'data'
            },
            {
                from: path.resolve(__dirname, '../src/data', 'cell-line-def.json'),
                to: 'data'
            },
            {
                from: path.resolve(__dirname, '../src/data', 'albums.json'),
                to: 'data'
            },
            {
                from: path.resolve(__dirname, '../src/images'),
                to: 'images'
            }
        ]
    ),
    new ExtractTextPlugin('style.[contenthash].css'),
    new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        minChunks(module) {
            return module.context && module.context.indexOf('node_modules') !== -1;
        }
    }),
    new webpack.optimize.CommonsChunkPlugin({
        name: 'runtime'
    }),
    new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'index.template.html')
    })
];

const BUNDLE_ANALYZER = [new BundleAnalyzerPlugin({ analyzerMode: 'static' })];

const PLUGINS_BY_ENV = {
    [Env.PRODUCTION]: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production'),
            CELL_VIEWER_URL: ProductionServers.CELL_VIEWER_URL,
            BASE_API_URL: ProductionServers.BASE_API_URL,
            THUMBNAIL_BASE_URL: ProductionServers.THUMBNAIL_BASE_URL,
            DOWNLOAD_URL_PREFIX: ProductionServers.DOWNLOAD_URL_PREFIX,
        }),
        new webpack.optimize.UglifyJsPlugin(),
        new webpack.HashedModuleIdsPlugin()
    ],
    [Env.STAGE]: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('staging'),
            CELL_VIEWER_URL: StagingServers.CELL_VIEWER_URL,
            BASE_API_URL: StagingServers.BASE_API_URL,
            THUMBNAIL_BASE_URL: StagingServers.THUMBNAIL_BASE_URL,
            DOWNLOAD_URL_PREFIX: ProductionServers.DOWNLOAD_URL_PREFIX,
        }),
        new webpack.NamedModulesPlugin()
    ],
    [Env.DEVELOPMENT]: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('dev'),
            CELL_VIEWER_URL: DevServers.CELL_VIEWER_URL,
            BASE_API_URL: DevServers.BASE_API_URL,
            THUMBNAIL_BASE_URL: DevServers.THUMBNAIL_BASE_URL,
            DOWNLOAD_URL_PREFIX: ProductionServers.DOWNLOAD_URL_PREFIX,
        }),
    ]
};

module.exports = (env, analyzer) => [
    ...BASE_PLUGINS,
    ...(analyzer ? BUNDLE_ANALYZER : []),
    ...(PLUGINS_BY_ENV[env] || [])
];
