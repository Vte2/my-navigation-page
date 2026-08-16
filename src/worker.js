// Cloudflare Worker —— 导航页后端
// 静态资源由 [assets] 托管（public/ 目录），本 Worker 只处理 /api/links
//
// GET  /api/links   所有人可读，返回 { sites, folders, theme, updatedAt }
// PUT  /api/links   需请求头 X-Admin-Token 与 Secret ADMIN_TOKEN 一致
// 支持 CORS：页面从 file:// 或 http://127.0.0.1:8137 打开时也能跨域调用
//
// 配置：wrangler.toml 中的 [[kv_namespaces]] 绑定 LINKS_KV
// 密钥：wrangler secret put ADMIN_TOKEN

const KV_KEY = 'navlinks_v1';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
  'Access-Control-Max-Age': '86400'
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/links') {
      if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
      if (request.method === 'GET') return handleGet(env);
      if (request.method === 'PUT') return handlePut(request, env);
      return json({ error: 'method not allowed' }, 405);
    }

    // 其余路径交给静态资源（index.html 等）
    return env.ASSETS.fetch(request);
  }
};

async function handleGet(env) {
  if (!env.LINKS_KV) return json({ error: 'KV 未绑定 LINKS_KV' }, 503);
  const raw = await env.LINKS_KV.get(KV_KEY);
  if (!raw) return json({ sites: [], folders: [], theme: 'dark', updatedAt: 0 });
  return new Response(raw, {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...CORS }
  });
}

async function handlePut(request, env) {
  if (!env.LINKS_KV) return json({ error: 'KV 未绑定 LINKS_KV' }, 503);
  if (!env.ADMIN_TOKEN) return json({ error: '服务端未配置 ADMIN_TOKEN' }, 503);

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
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...CORS }
  });
}
