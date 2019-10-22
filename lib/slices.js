const Url = require('url')
const fs = require('fs')
const FormData = require('form-data')

let http,
    limitSize = 1048576  // 1M

// 工具包
const utils = {
    parseUrl(url) {
        // 获取url参数
        let opt = {}

        url = Url.parse(url)
        opt.protocol = url.protocol

        let ssl = url.protocol === 'https:'

        opt.host = (ssl || url.protocol === 'http:') ? url.hostname : 'localhost'
        opt.port = url.port || (ssl ? 443 : 80)
        opt.path = url.pathname + (url.search ? url.search : '')
        opt.method = 'POST'

        return opt
    },
    getTime() {
        // 获取当前时间
        let date = new Date(),
            seperator2 = ":",
            hours = date.getHours(),
            minutes = date.getMinutes(),
            seconds = date.getSeconds()

        let currentdate =
            hours + seperator2 + minutes + seperator2 + seconds
        return currentdate
    }
}

class Slices {
    constructor(options) {

        this.init(options)
        this.run()

    }
    init(options) {

        let { opt, data, files, callback } = options

        // 文件本体
        let { path, size, name, to } = files[0]

        // 要提交的参数
        this.params = {
            blob_index: 0,
            total_blob: Math.ceil(size / limitSize)
        }

        this.opt = opt
        this.callback = callback

        this.file = fs.readFileSync(path)
        this.fileSize = size
        this.fileName = name

        console.log(`[File]: ${name}`)
        console.log(`[Size]: ${(size / limitSize).toFixed(2)}M`)
        console.log(`[Info]: This file is too large, it will be split into ${this.params.total_blob} pieces and then uploaded.`)

        // 参数合并
        Object.assign(this.params, data)

        Object.keys(data).forEach(key => {
            this.params[key] = data[key] + (key == 'to' ? to : '')
        })

    }
    slice() {

        // 切割文件

        let { blob_index, total_blob } = this.params

        if (blob_index == total_blob) {
            // 超过将不再执行
            return false
        }

        // 切割下一块
        let start = blob_index * limitSize,
            end = Math.min(this.fileSize, start + limitSize)

        this.params.file = this.file.slice(start, end)
        this.params.blob_index++

        return true

    }
    run() {

        let status = this.slice()

        // 判断是否还有分片
        if (status === false) {
            console.log('upload complete')
            this.callback && this.callback()
        } else {
            // 开始发送分片
            this.post()
        }

    }
    post() {
        
        let form = new FormData()

        let { blob_index, total_blob, file } = this.params

        delete this.params.file

        Object.keys(this.params).forEach(key => {
            form.append(key, this.params[key])
        })

        // file 字段重点关注，后端要求独立发送此字段，另外，header要重写字段
        form.append('file', file, {
            header: '--' + form.getBoundary() + '\r\nContent-Disposition: form-data; name="file";\r\n; filename="blob"\r\nContent-Type: application/octet-stream\r\nX-Custom-Header: 123\r\n\r\n',
            knownLength: 1
        })

        // 请求头写入
        this.opt.headers = form.getHeaders()

        // 发送文件
        let req = http.request(this.opt)
        form.pipe(req)

        req.on('response', res => {
            let status = res.statusCode
            if (status >= 200 && status < 300 || status === 304) {
                // 发送成功时打印一条信息
                console.log(`[${utils.getTime()}]: ${blob_index} block >> complete.`)
                // 发送下一个分片
                this.run()
            } else {
                // 显示服务器返回信息
                console.log(`[${utils.getTime()}]: ${blob_index} block >> failed[code:${status}].`)
            }
        })

        // 网络有问题
        req.on("error", err => {
            console.log(`request error [${err.message || err}]`)
        })
    }
}

module.exports = options => {

    // 参数处理
    if (!options.data.to) {
        options.data.to = options.to == '/' ? '' : options.to
    }

    // 请求参数处理
    options.opt = utils.parseUrl(options.receiver)

    // 按配置地址的协议加载http模块
    http = require(options.opt['protocol'] === 'https:' ? 'https' : 'http')

    new Slices(options)
}