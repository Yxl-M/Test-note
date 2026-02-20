# 简易笔记墙（静态前端 + Supabase + GitHub Pages）

这是最简单可行版本：
- 发布：图片和文字可任选其一（也可同时填写）
- 展示：所有访客都能看到最新笔记
- 无需自建后端

## 文件说明
- `index.html`：页面结构和 Supabase 配置入口
- `style.css`：基础样式
- `app.js`：上传图片、写入笔记、读取列表
- `supabase.sql`：数据库和存储桶初始化/迁移 SQL

## 背景图
- 背景图路径固定为 `assets/background.jpg`。
- 把你要用的照片放到仓库这个路径，页面会自动作为全屏背景显示。

## 1) 配置 Supabase
1. 在 Supabase 新建项目。
2. 打开 SQL Editor，执行 `supabase.sql`。
3. 在 `Project Settings -> API` 找到：
   - `Project URL`
   - `anon public` key（或 Publishable key）
4. 打开 `index.html`，替换：

```js
window.APP_CONFIG = {
  SUPABASE_URL: "YOUR_SUPABASE_URL",
  SUPABASE_ANON_KEY: "YOUR_SUPABASE_ANON_KEY",
};
```

## 2) 本地预览（可选）

```bash
python3 -m http.server 8080
```

然后访问 `http://localhost:8080`。

## 3) 部署到 GitHub Pages
1. 把这些文件推到 GitHub 仓库（默认分支如 `main`）。
2. 进入 GitHub 仓库 `Settings -> Pages`。
3. `Build and deployment` 选择：
   - `Source`: `Deploy from a branch`
   - `Branch`: `main` / `(root)`
4. 保存后等待 1-3 分钟，访问生成的 Pages 链接。

## 注意
- 这是 MVP，当前策略允许匿名发布，可能被滥用。
- 如果要更安全，下一步建议改成登录后才能发布（仅保留公开读取）。
