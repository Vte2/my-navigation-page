# 导航页 · Cloudflare Workers + KV 云端同步

本项目为 Git 连接的 Cloudflare Workers 项目：`git push` 到 `main` 分支即自动构建部署。

```
浏览器导航页/
├── public/
│   └── index.html        导航页本体（含云端同步逻辑）
├── src/
│   └── worker.js         Worker 后端（/api/links 接口 + 静态资源分发）
├── wrangler.toml         Worker 配置（KV 绑定、资源目录）
└── README.md             本文件
```

## 架构

- 静态页面由 Workers Static Assets 托管（`public/` 目录）
- `/api/links` 由 `src/worker.js` 处理：GET 公开读取，PUT 需 `X-Admin-Token`
- 链接数据存于 KV 命名空间 `navlinks`（绑定名 `LINKS_KV`）
- 管理员密码以加密 Secret 存储为 `ADMIN_TOKEN`

## 日常使用

- **你（管理员）**：打开网站 → 点右上角 🔒 → 输入管理员密码 → 按钮变 ☁️。之后添加/删除/排序网址自动同步到云端，所有访客可见
- **访客**：打开即最新数据；本地修改只影响自己的浏览器

## 部署

Git 连接已开启自动部署：推送 main 分支即上线。

手动部署（备用）：

```bash
npx wrangler deploy
```

## 运维备忘

- **改管理员密码**：`echo "新密码" | npx wrangler secret put ADMIN_TOKEN`
- **KV 全球同步延迟**：最多约 60 秒
- **免费额度**：Workers 10 万次请求/天 + KV 读 10 万次/天、写 1000 次/天，个人导航页用不完；超额只会当天失败，不产生费用
