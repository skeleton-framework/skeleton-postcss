'use strict'

/* Dependencies */
const fs = require('fs')
const postcss = require('postcss')
const Minify = require('clean-css')
const date = new Date()

/* https://gist.github.com/drodsou/de2ba6291aea67ffc5bc4b52d8c32abd */
let writeFileSyncRecursive = (filename, content, charset) => {
    // -- normalize path separator to '/' instead of path.sep,
    // -- as / works in node for Windows as well, and mixed \\ and / can appear in the path
    let filepath = filename.replace(/\\/g, '/')

    // -- preparation to allow absolute paths as well
    let root = ''
    if (filepath[0] === '/') {
        root = '/'
        filepath = filepath.slice(1)
    }
    else if (filepath[1] === ':') {
        root = filepath.slice(0, 3)   // c:\
        filepath = filepath.slice(3)
    }

    // -- create folders all the way down
    const folders = filepath.split('/').slice(0, -1)  // remove last item, file
    folders.reduce(
        (acc, folder) => {
            const folderPath = acc + folder + '/'
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath)
            }
            return folderPath
        },
        root // first 'acc', important
    )

    // -- write file
    fs.writeFileSync(root + filepath, content, charset)
}

class SkeletonPostCss {
    constructor(options = {}) {
        this.pkgName = options.pkgName || process.env.npm_package_name
        this.pkgVersion = options.pkgVersion || process.env.npm_package_version
        this.pkgLicense = options.pkgLicense || process.env.npm_package_license

        /* License Header */
        this.licenseHeaderText = options.licenseHeaderText ||
            `! ${this.pkgName} | ${this.pkgVersion} | ${this.pkgLicense} | ${date.getDay()}/${date.getDate()}/${date.getFullYear()}`

        /* PostCSS Plugins */
        this.postCssPlugins = options.postCssPlugins || [
            require('postcss-import'),
            require('autoprefixer'),
            require('postcss-banner')({
                banner: this.licenseHeaderText
            })
        ]
    }

    build = (input, output, min) => {
        let src = fs.readFileSync(input, 'utf8')
        return postcss(this.postCssPlugins)
            .process(src, {
                from: input,
                to: output
            })
            .then(function(result) {
                writeFileSyncRecursive(output, result.css)
                console.log('Build complete.')
                var minified = new Minify().minify(result.css).styles
                writeFileSyncRecursive(min, minified)
                console.log('Build minified.')
            })
    }
}

/* Build CSS */
module.exports = SkeletonPostCss
