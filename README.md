## 原始代码调整
### 1. 三端代码目录整合
将原本三个目录的代码合并到同一个项目目录中：
- 后端代码 ── backend/
- 管理端 ── frontend/web/
- 用户端 ── frontend/wapp/

### 2. 添加gitignore
对三个端各自的gitignore进行了微调，忽略了部分部署用的内容（后端代码最多，但未必全）和原先项目疏忽未加的内容
- 后端部分：新增ignore `cert/`和`logs/`
- 管理端：新增ignore `dist/`和标准的Node.gitignore内容
- 用户端：新增ignore `project.private.config.json`和标准的Node.gitignore内容

但由于对项目部署和开发的不熟悉，可能还会有多加的或漏加的。

关于[前端package.json和packeage-lock.json的原理](https://www.cnblogs.com/yalong/p/15013880.html)，本地新运行项目安装依赖时可能会修改packeage-lock.json，但两者确实不能ignore

关于后端`ab/`测试目录，推送后收到GitGuardian的安全警告，但无非是测试用户的token-auth泄露，鉴定为无妨，就先不管了；之后测试可尝试ci/cd

### 3. 后端依赖requirements.txt问题
通过后端代码中的requirements.txt大致可知python版本为3.8，但仍有很多无法通过pip安装（版本过新或根本找不到），于是先暂时注释处理（有些可能涉及部署，或单纯无用）

- `#`注释的项表示pip找不到相关包；
- `###`注释的项表示之后的安装会出错;

此外，修改包版本 Jinja（2.11.3 -> 3.0），libcomps（0.1.16 -> 0.1.15.post1）

如此便可顺利运行`pip install -r requirements.txt`完成基本依赖安装，但此时还无法跑起服务器，根据运行报错信息还需依次安装`pandas`,`similarities`,`torch`等包

可见之前的项目开发中python的环境管理比较混乱；我们不妨在新的虚拟环境下（virtualenv，或者用anaconda建一个python3.8的环境）进行开发，然后最后自己再导出一份requirements.txt

### 4. 修改了跨域请求服务器地址
前端的跨域请求原本是部署后的ip，先改回127.0.0.1了(`utils.js`和`vue.config.js`)


## 原始代码梳理

。。

## 开发者协作约定

1.保证仓库文件的换行符均为LF不混杂CRLF，不过只要大家git的配置中`core.autocrlf`为`true`或`input`就行（一般下载git时都是`true`），一般不用管（`git config --system --list`可查看）

。。
