/*
 * 模块入口
 */

'use strict';

const path = require('path')
const server = require(path.resolve(__dirname, 'lib/server'))
const rf = require(path.resolve(__dirname, 'lib/rf'))

// 接收命令行相关参数
var command = process.argv.slice(2) || 'prod'
var depConf = require(path.resolve('.', 'deploy-conf'))[command]

if(depConf){
    // 遍历文件
    let files = rf(depConf.form)
    
    // 开始传输流程
    server({
        receiver: depConf.receiver,
        to: depConf.to,
        files
    })
}else {
    console.warn('undefined command!')
}