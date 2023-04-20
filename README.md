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


## 开发者协作约定

1.保证仓库文件的换行符均为LF不混杂CRLF，不过只要大家git的配置中`core.autocrlf`为`true`或`input`就行（一般下载git时都是`true`），一般不用管（`git config --system --list`可查看）

### 分支管理规范
开发中分支为`dev`

- 对于每个开发者：若开发者`xrb`需要完成功能`景点搜索`，则需从`dev`分支新开一个分支`dev-xrb_景点搜索`(`git checkout -b dev-xrb_景点搜索`)，然后在其上进行目标任务开发；当完成并经过基本测试后，通过pull request合并进`dev`分支。一般情况下，不随意修改别人的分支，如发现问题联系相关分支开发者。

- 需要**注意**，每个分支在准备pr前，需要确认是否与最新`dev`分支相契合。操作是：在`dev`下进行`git pull`同步到最新。如发现有所改变，则需要进行修正（因为之前checkout出去时是基于旧的`dev`分支）。修正操作可二选一：
  - 切换到自己将要pr的分支，进行`git merge dev`，合并最新进展，并解决冲突
  - 切换到自己将要pr的分支，进行rebase操作（我没怎么用过，就不乱写了），具体原理查

- 到某阶段稳定版本时，会将`dev`合并进入`master`；重要版本打上`tag`并`release`

### 提交信息规范
> 借鉴自软工杰

#### 模板

```jsx
<type>(<scope>): <subject>

<body>
```

- type 有下面几类
  - `feat` 新功能
  - `fix` 修补bug（在 `<body>` 里面加对应的 Issue ID）
  - `test` 测试相关
  - `style` 代码风格变化（不影响运行）
  - `refactor` 重构（没有新增功能或修复 BUG）
  - `perf` 性能优化
  - `chore` 构建过程变动（包括构建工具/CI等）
- scope（可选）：影响的模块
- subject：主题（一句话简要描述）
- body（可选）：详细描述，包括相关的 issue、bug 以及具体变动等，可以有多行

#### 例子

```bash
[feat](账号模块): 增加微信登录验证
```
```bash
[fix](管理员 UI): Safari 下界面适配

1. xxx 元素 yyyy
2. aaa 页面 bbbb

Issue: #3
```
```bash
[refactor](招聘信息接口): xxx 接口更新
```
```bash
[style]: 格式规范更改，重新格式化
```

**请不要用 `fix #3` 之类的 message 关闭 Issue！请按照 BUG 提出与修复的描述用 Pull Request！**


### 问题交流
在Issues中发起一个新的issue（具体auto assign的功能还没尝试清楚）；完成问题则关闭该issue

bug的提出和修复也可通过issue

可对代码进行评论（具体功能尚未尝试清楚）
