const path = require('path');
const webpack = require('webpack');

module.exports = [{
  entry: './src/ledgerwebsocket.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  output: {
    filename: 'ledgerwebsocket.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'var',
    library: 'ledgerwebsocket'
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
        compress: { warnings: false }
      })
  ]
}];