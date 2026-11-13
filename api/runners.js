const L = require('./_lib');
module.exports = async (req, res) => {
  const ids = (await L.redis('SMEMBERS', 'runners')) || [];
  const all = (await Promise.all(ids.map(L.getRunner))).filter(Boolean);
  const mine = await L.me(req);
  res.json({ me: mine ? mine.id : null,
    runners: all.map(r => ({ id: r.id, name: r.name, best: r.best || null, look: r.look })) });
};
