var path = require('path');
module.exports = {
  node: {
    fs: "empty"
  },
  entry: './index.es',
  output: {
    path: __dirname,
    filename: 'build/bundle.js',
    libraryTarget: "umd",
    library: "LaunchableApp"
  },
  module: {
    loaders: [{
      test: /\.es$/,
      exclude: /(node_modules|bower_components)/,
      loader: 'babel-loader',
       // Options to configure babel with
      query: {
        presets: ['es2015',,],
      }
    } ]
  }
};
