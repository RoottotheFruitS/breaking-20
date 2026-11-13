const L = require('./_lib');
module.exports = async (req, res) => {
  if (!req.query.code) return res.redirect('/');
  const j = await L.stravaToken({ grant_type: 'authorization_code', code: req.query.code });
  if (!j.athlete) return res.status(400).send('Strava login failed');
  const old = (await L.getRunner(j.athlete.id)) || {};
  const r = { ...old, id: j.athlete.id,
    name: old.name || (j.athlete.firstname || 'RUNNER').toUpperCase().slice(0, 10),
    look: old.look || { shirt: '#e63946', shorts: '#1d3557', hair: '#3b2a1a', skin: '#f1c27d' },
    access_token: j.access_token, refresh_token: j.refresh_token, expires_at: j.expires_at,
    sid: old.sid || L.newSid(), joined: old.joined || Date.now() };
  await L.putRunner(r);
  res.setHeader('Set-Cookie', `sid=${r.id}.${r.sid}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=31536000`);
  res.redirect('/');
};
