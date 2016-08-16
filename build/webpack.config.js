/* webpack.config.js */

var webpack = require('webpack');

// 辅助函数
var utils = require('./utils');
var fullPath  = utils.fullPath;
var pickFiles = utils.pickFiles;

// 项目根路径
var ROOT_PATH = fullPath('../');
// 项目源码路径
var SRC_PATH = ROOT_PATH + '/src';
// 产出路径
var DIST_PATH = ROOT_PATH + '/dist';

// 是否是开发环境
var __DEV__ = process.env.NODE_ENV !== 'production';

// conf
var alias = pickFiles({
    id: /(conf\/[^\/]+).js$/,
    pattern: SRC_PATH + '/conf/*.js'
});

// components
alias = Object.assign(alias, pickFiles({
    id: /(components\/[^\/]+)/,
    pattern: SRC_PATH + '/components/*/index.js'
}));

// reducers
alias = Object.assign(alias, pickFiles({
    id: /(reducers\/[^\/]+).js/,
    pattern: SRC_PATH + '/js/reducers/*'
}));

// actions
alias = Object.assign(alias, pickFiles({
    id: /(actions\/[^\/]+).js/,
    pattern: SRC_PATH + '/js/actions/*'
}));


var config = {
    context: SRC_PATH,
    entry: {
        app: ['./pages/app.js']
    },
    output: {
        path: DIST_PATH,
        filename: 'js/bundle.js'
    },
    module: {},
    resolve: {
        alias: alias
    },
    plugins: [
        new webpack.DefinePlugin({
            // http://stackoverflow.com/questions/30030031/passing-environment-dependent-variables-in-webpack
            "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || 'development')
        })
    ]
};

// 使用缓存
var CACHE_PATH = ROOT_PATH + '/cache';

// loaders
config.module.loaders = [];
// 使用 babel 编译 jsx、es6
config.module.loaders.push({
    test: /\.js$/,
    exclude: /node_modules/,
    include: SRC_PATH,
    // 这里使用 loaders ，因为后面还需要添加 loader
    loaders: ['babel?cacheDirectory=' + CACHE_PATH]
});

config.entry.lib = [
    'react', 'react-dom', 'react-router',
    'redux', 'react-redux', 'redux-thunk'
]

config.output.filename = 'js/[name].js';

config.plugins.push(
    new webpack.optimize.CommonsChunkPlugin('lib', 'js/lib.js')
);

// 编译 sass
config.module.loaders.push({
    test: /\.(scss|css)$/,
    loaders: ['style', 'css', 'sass']
});

// css autoprefix
var precss = require('precss');
var autoprefixer = require('autoprefixer');
config.postcss = function() {
    return [precss, autoprefixer];
}

// html 页面
var HtmlwebpackPlugin = require('html-webpack-plugin');
config.plugins.push(
    new HtmlwebpackPlugin({
        filename: 'index.html',
        chunks: ['app','lib'],
        template: SRC_PATH + '/pages/app.html'
    })
);

// 压缩 js、css
config.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
        compress: {
            warnings: false
        }
    })
);

// 压缩 html
// html 页面
var HtmlwebpackPlugin = require('html-webpack-plugin');
config.plugins.push(
    new HtmlwebpackPlugin({
        filename: 'index.html',
        chunks: ['app', 'lib'],
        template: SRC_PATH + '/pages/app.html',
        minify: {
            collapseWhitespace: true,
            collapseInlineTagWhitespace: true,
            removeRedundantAttributes: true,
            removeEmptyAttributes: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true,
            removeComments: true
        }
    })
);

// 图片路径处理，压缩
config.module.loaders.push({
    test: /\.(?:jpg|gif|png|svg)$/,
    loaders: [
        'url?limit=8000&name=img/[hash].[ext]',
        'image-webpack'
    ]
});

// 开启热替换相关设置
if (hot === true) {
    config.entry.app.unshift('webpack/hot/only-dev-server');
    // 注意这里 loaders[0] 是处理 .js 文件的 loader
    config.module.loaders[0].loaders.unshift('react-hot');
    config.plugins.push(new webpack.HotModuleReplacementPlugin());
}

module.exports = config;