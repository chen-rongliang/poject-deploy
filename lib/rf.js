const fs = require('fs')

let fileArr = [], topDir, ignore = [
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
]

const rf = (filePath, fileArr) => {
    // 同步遍历目标文件夹
    fs.readdirSync(filePath).forEach((file) => {
        if(/node_modules/.test(filePath)){
            return false
        }else {
            states = fs.statSync(filePath + (filePath == './' ? '' : '/') + file)
            if (states.isDirectory()) {
                // 如果是目录就继续往下
                rf(filePath + (filePath == './' ? '' : '/') + file, fileArr)
            }
            else {
                //创建一个对象保存信息 
                if(ignore.indexOf(file) == -1){
                    let obj = new Object()
        
                    obj.name = file
                    obj.ext = file.split('.')[1]
                    obj.path = filePath + '/' + file
                    obj.to = obj.path.replace(topDir, '')
                    obj.size = states.size
                    
                    fileArr.push(obj)
                }
            }
        }
    })
}


module.exports = (filePath, ignoreList) => {
    // 传入忽略文件
    if(ignoreList instanceof Array && ignoreList.length){
        ignore = ignoreList
    }
    // 对路径处理调整处理
    if(/^\//.test(filePath)){
        if(filePath.length < 2){
            filePath = '.'
        }else {
            filePath = filePath.replace('/', '')
        }
    }
    topDir = filePath
    rf(filePath, fileArr)
    return fileArr
}