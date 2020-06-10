/*
 * 模块入口
 */

'use strict';
const fs = require('fs')
const path = require('path')
const md5 = require('js-md5')
const server = require(path.resolve(__dirname, 'lib/server'))
const slices = require(path.resolve(__dirname, 'lib/slices'))
const rf = require(path.resolve(__dirname, 'lib/rf'))
const targz = require(path.resolve(__dirname, 'lib/targz'))

// 接收命令行相关参数
var command = process.argv.slice(2)

// 命令为空
if ((command instanceof Array && command.length == 0) || !command) {
    command = 'prod'
}

var depConf = require(path.resolve('.', 'deploy-conf'))[command]

if (depConf) {
    if (!depConf.receiver) {
        console.error('receiver is required!')
    } else {
        let def
        if (depConf.zip) {
            // 如果有zip属性, 则表示把form目录内文件压缩，发送压缩包
            let to = depConf.to
            depConf.to = '/'
            def = targz(depConf.form, to)
        } else {
            // 没有，则遍历文件
            def = rf(depConf.form || '.', depConf.ignore || [], depConf.scriptTag)
        }

        // 如果有script属性
        if (depConf.script) {
            eval(depConf.script)
            delete depConf.script
        }

        def.then(files => {

            // 找到文件了
            if (files.length) {
                // 开始传输流程
                console.log('start upload => ' + command)
                // gzip包超过1M大小，或者配置中强制要求分片，用分片上传
                if(depConf.zip && (depConf.patch || files[0].size > 1048576)) {

                    // 删除多余配置
                    delete depConf.data.blob_index
                    delete depConf.data.total_blob

                    slices({
                        receiver: depConf.receiver,
                        to: depConf.to || '/',
                        data: depConf.data || {},
                        files,
                        callback: () => {
                            // 删除临时压缩文件
                            fs.unlink(files.pop().path, () => {})
                        }
                    })
                } else {
                    server({
                        receiver: depConf.receiver,
                        to: depConf.to || '/',
                        data: depConf.data || {},
                        files,
                        callback: () => {
                            // 删除临时压缩文件
                            fs.unlink(files.pop().path, () => {})
                        }
                    })
                }
            } else {
                console.log('no file.')
            }

        }).catch(err => {
            console.log(err)
        })

    }
} else {
    console.error('undefined command!')
}