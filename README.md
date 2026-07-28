# 启商智策管理咨询官网

企业咨询网站，部署于 GitHub Pages。

## 访问地址

**[https://enlightenedu.github.io/github.io/](https://enlightenedu.github.io/github.io/)**

## 内容管理后台 (CMS)

网站集成了 Decap CMS 可视化后台，可通过浏览器登录编辑内容。

### 后台地址

**[https://enlightenedu.github.io/github.io/admin/](https://enlightenedu.github.io/github.io/admin/)**

### 首次配置步骤

1. **创建 GitHub OAuth App**（一次性，约 3 分钟）
   - 访问 https://github.com/settings/developers
   - 点击 **New OAuth App**
   - 填写：
     - Application name: `启商智策 CMS`
     - Homepage URL: `https://enlightenedu.github.io/github.io`
     - Authorization callback URL: `https://decap-cms-oauth.netlify.app/callback`
   - 点击 **Register application**
   - 点击 **Generate a new client secret**
   - 记下 **Client ID**

2. **填入 Client ID**
   - 在 GitHub 仓库中打开 `admin/config.yml`
   - 将 `client_id` 配置项替换为第一步获得的 Client ID

3. **首次登录**
   - 保存后等待 ~1 分钟
   - 访问 `https://enlightenedu.github.io/github.io/admin/`
   - 点击 **Login with GitHub**
   - 授权后即可进入后台

### 发布新闻

1. 登录后台 → 左侧菜单 → **动态新闻**
2. 点击 **新建新闻**
3. 填写标题、日期、分类、摘要、正文
4. 点击 **发布** → 新闻自动保存为 Markdown 文件并 commit 到仓库
5. GitHub Action 自动更新新闻索引
6. 约 1 分钟后网站首页和新闻页显示新内容

## 网站结构

```
├── index.html          # 首页
├── news.html           # 新闻列表页
├── css/style.css       # 样式
├── js/main.js          # 主页交互
├── js/news-loader.js   # 新闻加载
├── admin/              # CMS 后台
│   ├── index.html
│   └── config.yml
├── content/
│   ├── news/           # 新闻 Markdown 文件
│   └── news.json       # 新闻索引（自动生成）
├── scripts/            # 构建脚本
└── images/             # 图片资源
```
