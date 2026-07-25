// Cloudflare Pages Functions —— /api/links
// 导航页链接云端同步后端（Cloudflare KV 存储）
//
// GET  /api/links   所有人可读，返回 { sites, folders, theme, updatedAt }
// PUT  /api/links   需请求头 X-Admin-Token 与环境变量 ADMIN_TOKEN 一致
//
// 需要在 Pages 项目中配置：
//   1. KV 命名空间绑定：变量名 LINKS_KV
//   2. 环境变量：ADMIN_TOKEN = 你的管理员密码

const KV_KEY = 'navlinks_v1';

export async function onRequestGet(context) {
  const { env } = context;
  if (!env.LINKS_KV) return json({ error: 'KV 未绑定 LINKS_KV' }, 503);

  const raw = await env.LINKS_KV.get(KV_KEY);
  if (!raw) return json({ sites: [], folders: [], theme: 'dark', updatedAt: 0 });

  return new Response(raw, {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
  });
}

export async function onRequestPut(context) {
  const { request, env } = context;
  if (!env.LINKS_KV) return json({ error: 'KV 未绑定 LINKS_KV' }, 503);
  if (!env.ADMIN_TOKEN) return json({ error: '服务端未配置 ADMIN_TOKEN 环境变量' }, 503);

  const token = request.headers.get('X-Admin-Token') || '';
  if (token !== env.ADMIN_TOKEN) return json({ error: 'unauthorized' }, 401);

  let body;
  try { body = await request.json(); } catch (e) { return json({ error: '请求体不是合法 JSON' }, 400); }
  if (!body || !Array.isArray(body.sites)) return json({ error: '数据格式不正确' }, 400);

  // 字段白名单清洗，防止写入畸形/超限数据
  const sites = body.sites.slice(0, 2000).map(s => ({
    id: String(s.id || '').slice(0, 40),
    name: String(s.name || '').slice(0, 100),
    url: String(s.url || '').slice(0, 2000),
    folder: String(s.folder || '').slice(0, 50),
    iconType: s.iconType === 'text' ? 'text' : 'auto',
    iconText: String(s.iconText || '').slice(0, 8)
  }));
  const folders = Array.isArray(body.folders)
    ? body.folders.slice(0, 100).map(f => String(f).slice(0, 50))
    : [];
  const theme = body.theme === 'light' ? 'light' : 'dark';
  const updatedAt = Date.now();

  await env.LINKS_KV.put(KV_KEY, JSON.stringify({ sites, folders, theme, updatedAt }));
  return json({ ok: true, updatedAt });
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
  });
}
