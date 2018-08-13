## poject-deploy说明文档 ##

> 版本： 1.0.7
> 更新： 2018-08-13

poject-deploy是一个简单的远端服务器部署工具，主要实现：

- **指定目录文件发送**
- **多服务器部署配置**

**后续按需求增加功能实现*

-------------------

## 使用说明

关于node和npm的安装就不说了，国内推荐使用cnpm

**在项目中安装组件：**

    npm i -S poject-deploy
    
**在项目根目录下添加 deploy-conf.json 配置文件：**

	{
	    "prod": {
	        "receiver": "http://server-url", // 部署服务器地址
	        "form": "/",                     // 文件目录，可缺省，默认为 "/"
	        "to": "server-save-path"         // 部署服务器保存的路径，可缺省，默认为 "/"
	    }
	}
	

需要部署时在项目运行命令

	poject-deploy prod


> 注：项目如果有多个部署配置，在配置文件中直接写即可，部署时poject-deploy [配置名]，不写默认会寻找prod配置，如果不存在会中止运行。