const crypto = require('crypto');
const KV = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KT = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const S = 'https://www.strava.com';

async function redis(...cmd) {
  const r = await fetch(KV, { method: 'POST', headers: { Authorization: `Bearer ${KT}` }, body: JSON.stringify(cmd) });
  return (await r.json()).result;
}
async function getRunner(id) { return JSON.parse((await redis('GET', 'runner:' + id)) || 'null'); }
async function putRunner(r) { await redis('SET', 'runner:' + r.id, JSON.stringify(r)); await redis('SADD', 'runners', String(r.id)); }

async function stravaToken(body) {
  const r = await fetch(S + '/oauth/token', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: process.env.STRAVA_CLIENT_ID, client_secret: process.env.STRAVA_CLIENT_SECRET, ...body }) });
  return r.json();
}
async function token(r) {
  if (r.expires_at * 1000 > Date.now() + 60000) return r.access_token;
  const j = await stravaToken({ grant_type: 'refresh_token', refresh_token: r.refresh_token });
  Object.assign(r, { access_token: j.access_token, refresh_token: j.refresh_token, expires_at: j.expires_at });
  await putRunner(r);
  return r.access_token;
}
async function api(r, path) {
  const res = await fetch(S + '/api/v3' + path, { headers: { Authorization: 'Bearer ' + (await token(r)) } });
  return res.json();
}
async function checkActivity(r, id) {
  const a = await api(r, '/activities/' + id);
  if (!/Run/.test(a.sport_type || a.type || '')) return;
  const e = (a.best_efforts || []).find(b => b.name === '5k');
  if (e && (!r.best || e.elapsed_time < r.best)) { r.best = e.elapsed_time; await putRunner(r); }
}
async function backfill(r) {
  const list = await api(r, '/athlete/activities?per_page=10');
  for (const a of list || []) if (/Run/.test(a.sport_type || a.type) && a.distance >= 5000) await checkActivity(r, a.id);
}
async function me(req) {
  const m = (req.headers.cookie || '').match(/sid=(\d+)\.(\w+)/);
  if (!m) return null;
  const r = await getRunner(m[1]);
  return r && r.sid === m[2] ? r : null;
}
const newSid = () => crypto.randomBytes(16).toString('hex');

module.exports = { redis, getRunner, putRunner, stravaToken, checkActivity, backfill, me, newSid };
