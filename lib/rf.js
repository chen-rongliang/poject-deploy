const fs = require('fs')

let fileArr = [], topDir

const rf = (filePath, fileArr) => {
    // 同步遍历目标文件夹
    fs.readdirSync(filePath).forEach((file) => {
        states = fs.statSync(filePath + '/' + file)
        if (states.isDirectory()) {
            // 如果是目录就继续往下
            rf(filePath + '/' + file, fileArr)
        }
        else {
            //创建一个对象保存信息 
            let obj = new Object()

            obj.name = file
            obj.ext = file.split('.')[1]
            obj.path = filePath + '/' + file
            obj.to = obj.path.replace(topDir, '')
            obj.size = states.size
            
            fileArr.push(obj)
        }
    })
}


module.exports = (filePath) => {
    topDir = filePath
    rf(filePath, fileArr)
    return fileArr
}