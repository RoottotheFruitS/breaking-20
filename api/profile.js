const L = require('./_lib');
module.exports = async (req, res) => {
  const r = await L.me(req);
  if (!r) return res.status(401).end();
  const b = req.body || {}, ok = c => /^#[0-9a-f]{6}$/i.test(c);
  if (b.name) r.name = String(b.name).toUpperCase().slice(0, 10);
  for (const k of ['shirt', 'shorts', 'hair', 'skin']) if (ok(b[k])) r.look[k] = b[k];
  await L.putRunner(r);
  res.json({ ok: true });
};
