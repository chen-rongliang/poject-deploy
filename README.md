## poject-deploy说明文档 ##

> 版本： 1.1.0
> 更新： 2019-10-22

poject-deploy是一个简单的远端服务器部署工具，主要实现：

- **指定目录文件发送**
- **多服务器部署配置**

- **v1.1.0 更新说明：添加分片上传**

**后续按需求增加功能实现*

-------------------

## 使用说明

关于node和npm的安装就不说了，国内推荐使用cnpm

**在项目中安装组件：**
```
    npm i -S poject-deploy
```
    
**在项目根目录下添加 deploy-conf.json 配置文件：**

```
{
    "prod": {
        "receiver": "http://server-url",        // 部署服务器地址，不可缺少！
        "form": "/",                            // 文件目录，可缺省，默认为当前目录
        "to": "server-save-path",		        // 部署服务器保存的路径，可缺省，默认为当前目录, 开启zip会默认重置为/，并且把目录包裹到要发送的文件夹上，即receiver为根目录
        "data": {},                             // 传送文件请求附加参数，可选
        "ignore": [],                           // 忽略文件，可选
        "scriptTag": "test-script",             // 如果遇到xss拦截script标签，可以编辑为自定义标签，让后端收到文件后把自定义标签还原为script标签，可选
        "zip": true,                            // 如果遇到xss全面拦截，可以转为压缩包发送，让后端收到文件后解压还原，设置后scriptTag失效，可选
        "script": "depConf.data.time=newDate/1" // 发送前运行可运行简单脚本逻辑，可选
    }
}
```

需要部署时在项目运行命令

```
	poject-deploy prod
```

> 注：项目如果有多个部署配置，在配置文件中直接写即可，部署时poject-deploy [配置名]，不写默认会寻找prod配置，如果不存在会中止运行。