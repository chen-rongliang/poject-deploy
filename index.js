/*
 * 模块入口
 */

'use strict';

const path = require('path')
const md5 = require('js-md5')
const server = require(path.resolve(__dirname, 'lib/server'))
const rf = require(path.resolve(__dirname, 'lib/rf'))

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
        // 遍历文件
        let files = rf(depConf.form || '.', depConf.ignore || [])

        // 如果有script属性
        if (depConf.script) {
            eval(depConf.script)
            delete depConf.script
        }

        // 找到文件了
        if (files.length) {
            // 开始传输流程
            console.log('start upload => ' + command)
            server({
                receiver: depConf.receiver,
                to: depConf.to || '/',
                data: depConf.data || {},
                files
            })
        } else {
            console.log('no file.')
        }
    }
} else {
    console.error('undefined command!')
}