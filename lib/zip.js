const fs = require('fs')
const zipper = require("zip-local")

const fileName = 'dist.zip'

// 整理文件信息
const stat = (path) => {

    let info = fs.statSync(path)

    return {
        name: fileName,
        ext: 'zip',
        path,
        to: `/${fileName}`,
        size: info.size
    }

}

module.exports = folder => {

    // 对路径处理调整处理
    if (/^\//.test(folder)) {
        if (folder.length < 2) {
            folder = '.'
        } else {
            folder = folder.replace('/', '')
        }
    }

    let output = `${folder}/${fileName}`

    zipper.sync.zip(folder).compress().save(output)

    return [
        stat(output)
    ]

}