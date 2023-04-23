# 开发者协作约定

1.保证仓库文件的换行符均为LF不混杂CRLF，不过只要大家git的配置中`core.autocrlf`为`true`或`input`就行（一般下载git时都是`true`），一般不用管（`git config --system --list`可查看）

## 一、分支管理规范
可以试试`版本2`（反正我之后的分支要试试），看看如何

### 1. 版本1
开发中分支为`dev`

- 对于每个开发者：若开发者`xrb`需要完成功能`景点搜索`，则需从`dev`分支新开一个分支`dev-xrb_景点搜索`(`git checkout -b dev-xrb_景点搜索`)，然后在其上进行目标任务开发；当完成并经过基本测试后，通过pull request合并进`dev`分支。一般情况下，不随意修改别人的分支，如发现问题联系相关分支开发者。

- 需要**注意**，每个分支在准备pr前，需要确认是否与最新`dev`分支相契合。操作是：在`dev`下进行`git pull`同步到最新。如发现有所改变，则需要进行修正（因为之前checkout出去时是基于旧的`dev`分支）。修正操作可二选一：
  - 切换到自己将要pr的分支，进行`git merge dev`，合并最新进展，并解决冲突
  - 切换到自己将要pr的分支，进行rebase操作（我没怎么用过，就不乱写了），具体原理查

- 到某阶段稳定版本时，会将`dev`合并进入`master`；重要版本打上`tag`并`release`

### 2. 版本2
> 借鉴自软工杰，小调整

#### 2.1 模板和样例
对于非

```jsx
type 为后三类：
  <type>/<name>(developer_name)

type 为前三类：
  <type>
```

- type: 分支类型（见下文阐述中后三类）
- name: 相关内容名（对于fix分支，若未提过issue可自行拟定名字）
- developer：本分支开发者名
单词间用'-'分割

**举例**：
`master` `dev`
`feature/travel-plan-preview(xrb)`
`chore/ci-pipeline-deploy(zrp)`

#### 2.2 分支类型详述
代码仓库分支分为以下六类：

1. master 分支 `线上在跑的版本`
    1. 提供给用户使用的**正式版本**和**稳定版本**；
    2. 🏷️ 所有**版本发布**和 **Tag** 操作都在这里进行；
    3. ❌ **不允许**开发者日常 push，只允许从 release 合并。
2. release 分支 `将要上线的版本`
    1. 从 develop 分支检出，只用于发布前的确认；
    2. 允许从中分出 fix 分支，修复的 commit 需要 push 回 dev；
    3. ❌ **不允许**开发者日常 push，只允许从 dev 合并。
3. dev 分支 `日常开发汇总`
    1. 开发者可以检出 feature 和 fix 分支，开发完成后 push 回 dev；
    2. 保证领先于 main；
    3. ❌ **不允许**开发者日常 push，只允许完成功能开发或 bug 修复后通过 pull request 进行合并。
4. feature 分支
    1. 从 dev 分支检出，用于新功能开发；
    2. 命名为 `feature/name`，如 `feature/resume_generation`；
    3. 开发完毕，经过测试后合并到 dev 分支；
    4. ✅ 允许开发者日常 push.
5. fix 分支
    1. 从 dev 或 release 分支检出，用于 bug 修复（feature 过程中的 bug 直接就地解决）；
    2. **特殊情况下**允许直接从 main 直接开 fix 分支进行修复；
    3. 命名为 `fix/issue_id`，如 `fix/2` ;
    4. 修复完毕，经过测试后合并到原来的分支（dev/release/main），**并且保证同时合并到 dev**;
    5. ✅ 允许开发者日常 push.
6. chore 分支
    1. 从 dev 分支检出，用于各项修正，如重构、风格优化等；
    2. 命名为 `chore/name`，如 `chore/resume_generation`；
    3. 开发完毕，经过测试后合并到 dev 分支；
    4. ✅ 允许开发者日常 push.



## 二、提交信息规范
> 借鉴自软工杰，小调整

### 1. 模板

```jsx
<type>(<scope>): <subject>

<body>
```

- type 有下面几类
  - `feat` 新功能
  - `fix` 修补bug（在 `<body>` 里面加对应的 Issue ID）
  - `test` 测试相关
  - `style` 代码风格变化（不影响运行）
  - `refact` 重构（没有新增功能或修复 BUG）
  - `perf` 性能优化
  - `chore` 构建过程变动（包括构建工具/CI等）
- scope（可选）：影响的模块
- subject：主题（一句话简要描述）
- body（可选）：详细描述，包括相关的 issue、bug 以及具体变动等，可以有多行

### 2. 例子

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
