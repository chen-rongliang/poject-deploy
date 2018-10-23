const Url = require('url')
const fs = require('fs')
const FormData = require('form-data')

let http,
    // 文件队列计数器
    idx = 0,
    // 静态方法，不足10的数字前面补0
    plusZero = function(num) {
        String(num).padStart(2, '0')
        return num
    }

// server Function
var SentServer = function(options) {
        return new SentServer.fn.init(options)
    },
    endl = '\r\n'

SentServer.fn = SentServer.prototype = {
    init: function(options) {
        // 初始化url参数

        this.options = options

        if (!options.data.to) {
            options.data.to = options.to == '/' ? '' : options.to
        }

        options.opt = this.parseUrl(options.receiver)

        // 按配置地址的协议加载http模块
        http = require(options.opt['protocol'] ? 'https' : 'http')

        this.start()

    },
    start: function() {

        let form = new FormData(),
            file = this.options.files[idx]


        Object.keys(this.options.data).forEach(key => {
            form.append(key, this.options.data[key] + (key == 'to' ? file.to : ''))
        })

        form.append('file', fs.createReadStream(file.path))

        this.upload(form, this.options.opt, () => {
            idx++
            if (this.options.files.length > idx) {
                this.start()
            } else {
                // 队列上传完成
                console.log('upload complete.')
            }
        })

    },
    upload: function(form, opt, callback) {
        let _self = this

        opt.headers = form.getHeaders()

        let request = http.request(opt, res => {
            res
                .on('data', function() {})
                .on('end', function() {
                    let status = res.statusCode,
                        file = _self.options.files[idx]

                    if (status >= 200 && status < 300 || status === 304) {
                        // 发送成功时打印一条信息
                        console.log(`[${_self.getTime()}]:${file.path} >> ${_self.options.data.to + file.to}.`)
                    } else {
                        // 显示服务器返回信息
                        console.log(`[${_self.getTime()}]:upload file:[${file.name}] failed[code:${status}].`)
                    }
                    // 销毁数据
                    collect = opt = null
                        // 执行回调
                    callback && callback()
                })
                .on('error', function(err) {
                    // 出错
                    console.log(err.message || err)
                })
        })

        form.pipe(request)

    },
    parseUrl: function(url) {
        // 获取url参数
        let opt = {}
        url = Url.parse(url)
        opt.protocol = url.protocol
        var ssl = url.protocol === 'https:'
        opt.host = (ssl || url.protocol === 'http:') ? url.hostname : 'localhost'
        opt.port = url.port || (ssl ? 443 : 80)
        opt.path = url.pathname + (url.search ? url.search : '')
        opt.method = 'POST'
        return opt
    },
    getTime: function() {
        // 获取当前时间
        let date = new Date(),
            // seperator1 = "-",
            seperator2 = ":",
            // month = plusZero(date.getMonth() + 1),
            // strDate = plusZero(date.getDate()),
            hours = plusZero(date.getHours()),
            minutes = plusZero(date.getMinutes()),
            seconds = plusZero(date.getSeconds())

        var currentdate =
            /*date.getFullYear() + seperator1 + month + seperator1 + strDate
                       + " " + */
            hours + seperator2 + minutes + seperator2 + seconds
        return currentdate
    }
}
SentServer.fn.init.prototype = SentServer.fn

module.exports = SentServer