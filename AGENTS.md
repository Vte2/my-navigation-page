# 我的导航（个人起始页）

## 项目结构（2026-07-26 起为 Cloudflare Workers 架构）

- `public/index.html`：导航页本体（单文件、零依赖，CSS/JS 全部内联）。
  原名 `我的导航.html`，接入 KV 云同步时改名 `index.html`，随后迁入 `public/`。
- `src/worker.js`：Worker 后端，提供 `/api/links`（GET 公开读 / PUT 需
  `X-Admin-Token`，存 Cloudflare KV）。
- `wrangler.toml`：Workers 配置（assets 指向 `public/`，KV 绑定）。

页面数据：
- 链接/文件夹/主题：线上部署时以 KV 为准（启动时拉取，管理员解锁后推送）；
  本地打开时 `/api/links` 不可用，静默回退到 localStorage（键 `nav_v9`）。
- 其他 localStorage 键：`navBg3`、`navEng`、`navZoom`、`navPerf`、`navSpring`、管理员 token。
- IndexedDB：库 `navWallpapers` / store `wallpapers`（壁纸 Blob，keyPath `id`）。
- 数据与 origin 绑定：file://、http://127.0.0.1:8137、线上域名各是一份。
  Chrome 中所有 file:// 页面共享同一存储区。

## Chrome 新标签页方案

新版 Chrome 禁止扩展页面以任何方式加载 `file://`（`location` 跳转和
`<iframe>` 嵌入都会报 `Not allowed to load local resource`，"允许访问文件网址"
开关无效），所以采用 **本地 HTTP 服务 + 扩展跳转**：

- `newtab-extension/`：MV3 扩展，`chrome_url_overrides.newtab` →
  `newtab.html` → 外部脚本 `newtab.js` 跳转到 `http://127.0.0.1:8137/`
  （http.server 对目录请求自动返回 `public/index.html`）。
  需在 `chrome://extensions` 开开发者模式后"加载已解压的扩展程序"手动安装。
- `start-nav-server.vbs`：隐藏窗口启动
  `python -m http.server 8137 --bind 127.0.0.1 --directory <项目目录>\public`。
  必须用 `python.exe` 而不是 `pythonw.exe`——后者 `sys.stderr` 为 `None`，
  `http.server` 每条请求写日志时会抛 `AttributeError`，服务直接失效。
- `install-autostart.bat`：把 vbs 复制到 `shell:startup` 实现开机自启。
- 本地快速打开（书签/启动页推荐）：
  `file:///C:/Users/Vte/Documents/New%20project/public/index.html`

### 注意事项

- MV3 扩展页面禁止内联脚本和内联事件处理器（CSP），扩展里的页面一律用外部 `.js` 文件。
- 导航页"背景设置"里 `file:///` 直链在 http 页面下无法加载，壁纸必须通过
  "壁纸库 → 添加新壁纸"存入 IndexedDB。
- 修改 `public/index.html` 后无需重启服务，刷新页面即生效。
- 历史教训：数据迁移若含大体积壁纸 Blob，不能用 JSON 序列化
  （会撞 V8 字符串长度上限），要按二进制拼接传输。

## 停用方法

1. `chrome://extensions` 停用"我的导航 - 新标签页"扩展（新标签页恢复默认）
2. `Win+R` → `shell:startup` → 删除 `start-nav-server.vbs`（取消开机自启）
3. 重启电脑，或手动结束占用 8137 端口的 python 进程

浏览器里已保存的网站/壁纸数据不会丢，重新启用即恢复。
