const Url = require('url')
const fs = require('fs')
const path = require('path')
let http, idx = 0,
plusZero = function (num) {
    if (num >= 0 && num <= 9) {
        num = "0" + num
    }
    return num
}

// server Function
var SentServer = function (options) {
    return new SentServer.fn.init(options)
}, endl = '\r\n'
SentServer.fn = SentServer.prototype = {
    init: function (options) {
        // 初始化url参数

        this.data = options.data || {}
        this.data.to = options.to
        this.files = options.files
        this.url = options.receiver

        http = require(this.parseUrl()['protocol'] ? 'https' : 'http')

        this.start()

    },
    start: function () {
        // 遍历文件
        this.format(this.parseUrl())
    },
    format: function (opt) {
        // console.log(opt)
        let collect = [], length = 0, rs
        boundary = '-----np' + Math.random(),
        _self = this,
        data = _self.data,
        file = _self.files[idx]

        // 把相关的表单参数提取出来
        Object.keys(data).forEach(key => {
            collect.push('--' + boundary + endl);
            collect.push('Content-Disposition: form-data; name="' + key + '"' + endl);
            collect.push(endl);
            collect.push(data[key] + (key == 'to' ? file.to : '') + endl);
        })

        // 把文件转成buf，也放进去
        collect.push('--' + boundary + endl)
        collect.push('Content-Disposition: form-data; name="file"; filename="' + file.path + '"' + endl)
        collect.push(endl)
        // 转换过程，即读取文件内容
        rs = fs.createReadStream(file.path)
        rs.on('data', function (chunk) {
            collect.push(chunk)
            collect.push(endl)
            collect.push('--' + boundary + '--' + endl)
        })
        rs.on('end', function () {
            // 读取文件之后计算全部待传递字段的长度
            collect.forEach(function (ele) {
                if (typeof ele === 'string') {
                    length += Buffer.from(ele).length
                } else {
                    length += ele.length;
                }
            })

            opt.headers = {
                'Content-Type': 'multipart/form-data; boundary=' + boundary,
                'Content-Length': length
            }
            // 开始上传
            _self.upload(collect, opt, function () {
                // 新一轮循环
                idx ++
                if(_self.files.length > idx){
                    _self.start()
                }
            })
        })
    },
    upload: function (collect, opt, callback) {
        var _self = this
        var req = http.request(opt, function (res) {
            var status = res.statusCode
            var body = ''
            res
                .on('data', function (chunk) {
                    body += chunk
                })
                .on('end', function () {
                    
                    if (status >= 200 && status < 300 || status === 304) {
                        // console.log(null, body)
                        console.log(`[${_self.getNowFormatDate()}]:[${_self.files[idx].path}] to [${_self.url + _self.data.to + _self.files[idx].to}].`)
                    } else {
                        console.log(`upload file:[${_self.files[idx].name}] failed.`)
                    }
                    // 销毁数据
                    collect = opt = null
                    // 执行回调
                    callback && callback()
                })
                .on('error', function (err) {
                    console.log(err.message || err)
                })
        });
        collect.forEach(function (d) {
            req.write(d);
        });
        req.end()
    },
    parseUrl: function () {
        // 获取url参数
        let opt = {}
        let url = Url.parse(this.url)
        var ssl = url.protocol === 'https:'
        opt.protocol = ssl
        opt.host = (ssl || url.protocol === 'http:') ? url.hostname : 'localhost'
        opt.port = url.port || (ssl ? 443 : 80)
        opt.path = url.pathname + (url.search ? url.search : '')
        opt.method = 'POST'
        return opt
    },
    getNowFormatDate: function () {
        let date = new Date(),
        seperator1 = "-",
        seperator2 = ":",
        month = plusZero(date.getMonth() + 1),
        strDate = plusZero(date.getDate()),
        hours = plusZero(date.getHours()),
        minutes = plusZero(date.getMinutes()),
        seconds = plusZero(date.getSeconds())

        var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
                + " " + hours + seperator2 + minutes + seperator2 + seconds
        return currentdate
    }
}
SentServer.fn.init.prototype = SentServer.fn


module.exports = SentServer