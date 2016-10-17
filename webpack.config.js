var path = require('path');
var webpack = require('webpack');

var libraryName = 'image-marker';
var env = process.env.WEBPACK_ENV;

var config = {
	entry: path.resolve(__dirname, 'src/index.js'),
	devtool: 'source-map',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: libraryName + '.js',
		library: libraryName,
		libraryTarget: 'umd',
		umdNamedDefine: true
	},
	module: {
		loaders: [{
			test: /\.js$/,
			loader: 'babel',
			exclude: /node_modules/
		}]
	},
	resolve: {
		root: path.resolve('./src'),
		extensions: ['', '.js']
	},
	plugins: []
};

if (env === 'prod') {
	config.plugins.push(new webpack.optimize.UglifyJsPlugin({minimize: true}));
	config.output.filename = libraryName + '.min.js';
}

module.exports = config;
