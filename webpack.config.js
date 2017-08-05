'use strict';

const webpack = require('webpack');// need to be installed locally npm i webpack
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: "./dist/bundle.js"
    },

    // watch: true,
    // watchOptions: {
    // 	aggregateTimeout: 100 //wait after changes //300 default
    // },

    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new HtmlWebpackPlugin({
            template: './src/index.html',
        }),
        new webpack.SourceMapDevToolPlugin({
            filename: './dist/bundle.js.map',
            //exclude: ['vendor.js']
        })
    ],

    devServer: {
        //host: 'localhost', //default
        //port: 8080, //default
        contentBase: './dist',
        hot: true,
    }

};
