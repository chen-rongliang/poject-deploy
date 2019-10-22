const fs = require('fs')

let fileArr = [],
    topDir, ignore = [
        'Makefile',
        'README.md',
        '.babelrc',
        '.editorconfig',
        '.gitignore',
        '.postcssrc.js',
        'deploy-conf.json',
        'package-lock.json',
        'package.json',
        'postcss.config.js',
        'webpack.config.js',
    ],
    replaceTag = 'script',
    scriptReg = {
        start: /<script/g,
        end: /\/script>/g
    }

const rt = path => {

    // 针对xss拦截script标签的设定，当编辑了scriptTag属性之后，会对js和html文件进行更替操作

    let file = fs.readFileSync(path, 'utf-8')

    result = file
        .replace(scriptReg['start'], `<${replaceTag}`)
        .replace(scriptReg['end'], `/${replaceTag}>`)

    if (file !== result) {
        fs.writeFileSync(path, result, 'utf-8')
    }
}

const rf = (filePath, fileArr) => {
    // 同步遍历目标文件夹
    fs.readdirSync(filePath).forEach((file) => {
        if (/node_modules/.test(filePath)) {
            return false
        } else {
            states = fs.statSync(filePath + (filePath == './' ? '' : '/') + file)
            if (states.isDirectory()) {
                // 如果是目录就继续往下
                rf(filePath + (filePath == './' ? '' : '/') + file, fileArr)
            } else {
                //创建一个对象保存信息 
                if (ignore.indexOf(file) == -1) {
                    let obj = new Object()

                    obj.name = file
                    obj.ext = file.split('.')[1]
                    obj.path = filePath + '/' + file
                    obj.to = obj.path.replace(topDir, '')

                    // 判断文件为html或js，且需要更替script标签
                    if (/html|js/.test(obj.ext) && replaceTag != 'script') {
                        rt(obj.path)
                    }

                    obj.size = states.size

                    fileArr.push(obj)
                }
            }
        }
    })
}


module.exports = (filePath, ignoreList, scriptTag) => {
    // 传入忽略文件
    if (ignoreList instanceof Array && ignoreList.length) {
        ignore = ignoreList
    }
    // 对路径处理调整处理
    if (/^\//.test(filePath)) {
        if (filePath.length < 2) {
            filePath = '.'
        } else {
            filePath = filePath.replace('/', '')
        }
    }

    topDir = filePath
    if (scriptTag) replaceTag = scriptTag

    rf(filePath, fileArr)
    return Promise.resolve(fileArr)
}