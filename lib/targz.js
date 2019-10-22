const fs = require('fs')
const archiver = require('archiver')

const fileName = 'dist.tar.gz'

// 整理文件信息
const stat = (path) => {

    let info = fs.statSync(path)

    return {
        name: fileName,
        ext: 'tar.gz',
        path,
        to: `/${fileName}`,
        size: info.size
    }

}

module.exports = (folder, wrap) => {

    // 对路径处理调整处理
    if (/^\//.test(folder)) {
        if (folder.length < 2) {
            folder = '.'
        } else {
            folder = folder.replace('/', '')
        }
    }

    let output = `${folder}/${fileName}`

    // 已存在写入流会报错
    fs.unlink(output, err => {})

    return new Promise(resolve => {

        let archive = archiver('tar', {
            gzip: true
        })

        // add files
        archive.directory(folder, wrap)

        // write stream
        let ws = fs.createWriteStream(output)

        ws.once('close', () => {
            // close then return result
            resolve([stat(output)])
        })

        // pipe stream
        archive.pipe(ws)

        // close archive stream
        archive.finalize()

    })

}