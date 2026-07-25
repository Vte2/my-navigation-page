# 导航页 · Cloudflare KV 云端同步

本项目已接入 Cloudflare KV 云端同步，部署配置全部完成。

```
浏览器导航页/
├── index.html                  导航页本体（含云端同步逻辑）
├── functions/api/links.js      后端接口 GET/PUT /api/links
├── wrangler.toml               Pages 配置（含 LINKS_KV 绑定声明）
└── README.md                   本文件
```

## 当前状态（2026-07-26 已完成部署）

- KV 命名空间：`navlinks`（ID `e948692deb6640c3a20870996baa3beb`）
- KV 绑定：通过 `wrangler.toml` 声明 `LINKS_KV`（此项目的绑定由 wrangler.toml 管理，dashboard 上不可直接编辑）
- 管理员密码：以加密 Secret 形式存储为 `ADMIN_TOKEN`（dashboard 不可见明文）
- 云端初始数据：已推送 54 个链接
- 线上地址：https://my-navigation-page-cmj.pages.dev/ （接口 /api/links 已生效）

## 日常使用

- **你（管理员）**：打开网站 → 点右上角 🔒 → 输入管理员密码 → 按钮变 ☁️。之后添加/删除/排序网址会自动同步到云端，所有访客打开都能看到
- **访客**：无需任何操作，打开即是最新数据；他们自己的修改只存在本地浏览器
- 换电脑/换浏览器：重新点 🔒 输一次密码即可

## 以后修改部署

改完代码后在项目目录执行：

```bash
npx wrangler pages deploy . --project-name=my-navigation-page --branch=main --commit-dirty=true
```

## 运维备忘

- **改管理员密码**：`echo "新密码" | npx wrangler pages secret put ADMIN_TOKEN --project-name=my-navigation-page`，然后重新部署一次生效
- **KV 全球同步延迟**：最多约 60 秒，访客可能晚 1 分钟看到更新
- **免费额度**：KV 读 10 万次/天、写 1000 次/天，个人导航页用不完；超额只会当天失败，不产生费用
