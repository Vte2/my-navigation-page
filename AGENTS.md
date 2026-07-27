# 我的导航（个人起始页）

主文件是单文件导航页 `我的导航.html`（约 1900 行，零依赖，CSS/JS 全部内联）。

页面数据保存在浏览器本地存储，**与 origin 绑定**：
- localStorage：`nav_v9`（网站/文件夹/主题）、`navBg3`（当前壁纸指针）、`navEng`、`navZoom`、`navPerf`、`navSpring`
- IndexedDB：库 `navWallpapers`，store `wallpapers`（壁纸库，图片/视频以 Blob 存储，keyPath 为 `id`）

## Chrome 新标签页方案（2026-07 起）

新版 Chrome 禁止扩展页面以任何方式加载 `file://`（`location` 跳转和
`<iframe>` 嵌入都会报 `Not allowed to load local resource`，"允许访问文件网址"
开关无效），所以采用 **本地 HTTP 服务 + 扩展跳转**：

- `newtab-extension/`：MV3 扩展，`chrome_url_overrides.newtab` →
  `newtab.html` → 外部脚本 `newtab.js` 跳转到
  `http://127.0.0.1:8137/我的导航.html`。
  需在 `chrome://extensions` 开开发者模式后"加载已解压的扩展程序"手动安装。
- `start-nav-server.vbs`：隐藏窗口启动
  `python -m http.server 8137 --bind 127.0.0.1 --directory <项目目录>`。
  必须用 `python.exe` 而不是 `pythonw.exe`——后者 `sys.stderr` 为 `None`，
  `http.server` 每条请求写日志时会抛 `AttributeError`，服务直接失效。
- `install-autostart.bat`：把 vbs 复制到 `shell:startup` 实现开机自启。

### 注意事项

- MV3 扩展页面禁止内联脚本和内联事件处理器（CSP），扩展里的页面一律用外部 `.js` 文件。
- 页面数据现存在 `http://127.0.0.1:8137` 这个 origin 下；旧 `file://` 数据已用
  二进制打包方式迁移过一次（941MB，JSON 序列化会撞 V8 字符串长度上限）。
- 导航页"背景设置"里 `file:///` 直链在 http 页面下无法加载，壁纸必须通过
  "壁纸库 → 添加新壁纸"存入 IndexedDB。
- 修改 `我的导航.html` 后无需重启服务，刷新页面即生效（服务读磁盘最新文件）。

## 停用方法

1. `chrome://extensions` 停用"我的导航 - 新标签页"扩展（新标签页恢复默认）
2. `Win+R` → `shell:startup` → 删除 `start-nav-server.vbs`（取消开机自启）
3. 重启电脑，或手动结束占用 8137 端口的 python 进程

浏览器里已保存的网站/壁纸数据不会丢，重新启用即恢复。
