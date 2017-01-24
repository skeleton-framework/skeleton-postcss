/*jslint node: true */
'use strict';

/* Dependencies */
var fs = require('fs');
var postcss = require('postcss')
var Minify = require('clean-css')
var date = new Date()

var options = options || {}
var pkgname = options.name || process.env.npm_package_name
var pkgversion = options.version || process.env.npm_package_version
var pkglicense = options.pkglicense || process.env.npm_package_license

/* License Header */
var license = license ||
    '! ' + pkgname +
    ' | ' + pkgversion +
    ' | ' + pkglicense +
    ' | ' + date.getDay() +
    '/' + date.getDate() +
    '/' + date.getFullYear() + ' ';

/* PostCSS Plugins */
var plugins = [
    require('postcss-import'),
    require('postcss-custom-properties'),
    require('postcss-calc')({
        precision: 10
    }),
    require('autoprefixer'),
    require('postcss-banner')({
        banner: license
    })
];

/* Build CSS */
module.exports = function (input, output, min) {
    var src = fs.readFileSync(input, 'utf8');
    postcss(plugins)
        .process(src, {
            from: input,
            to: output
        })
        .then(function (result) {
            fs.writeFileSync(output, result.css);
            console.log('Build complete.');
            var minified = new Minify().minify(result.css).styles;
            fs.writeFileSync(min, minified);
            console.log('Build minified.');
        });
};
