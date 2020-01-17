const TerserPlugin = require("terser-webpack-plugin"); 
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const iswsl = require("is-wsl");
const ora = require("ora");
const chalk = require("chalk");
const rimraf = require("rimraf");
const path = require("path");
const config = require("./config");

process.env.NODE_ENV = "production";

const webpackConfig = {
    mode: "production",
    plugins: [
        new MiniCssExtractPlugin({
            filename: "css/[name].[contenthash:8].css",
            chunkFilename: "css/[name].chunk.[contenthash:8].css"
        })
    ],
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                test: /\.(js|jsx)(\?.*)?$/i,
                exclude: /node_modules/,
                cache: true,
                parallel: !iswsl,
                terserOptions: {
                    parse: {
                        // We want terser to parse ecma 8 code. However, we don't want it
                        // to apply any minification steps that turns valid ecma 5 code
                        // into invalid ecma 5 code. This is why the 'compress' and 'output'
                        // sections only apply transformations that are ecma 5 safe
                        // https://github.com/facebook/create-react-app/pull/4234
                        ecma: 8  //es8及以下
                    },
                    compress: {
                        ecma: 5,  //es5及以下
                        // Disabled because of an issue with Uglify breaking seemingly valid code:
                        // https://github.com/facebook/create-react-app/issues/2376
                        comparisons: false,
                        // Disabled because of an issue with Terser breaking valid code:
                        // https://github.com/facebook/create-react-app/issues/5250
                        // Pending further investigation:
                        // https://github.com/terser-js/terser/issues/120
                        inline: 2
                    },
                    output: {
                        ecma: 5,  //es5及以下
                        // Turned on because emoji and regex is not minified properly using default
                        // https://github.com/facebook/create-react-app/issues/2488
                        ascii_only: true,
                    }
                }
            })
        ],
        moduleIds: "hashed"
    }
};

const spinner = ora("building for production");
spinner.start();

rimraf(path.resolve(__dirname, "..", config.outputPathname), err => {

});