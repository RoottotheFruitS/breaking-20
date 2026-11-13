const L = require('./_lib');
module.exports = async (req, res) => {
  if (req.method === 'GET') {
    if (req.query['hub.verify_token'] === process.env.WEBHOOK_VERIFY_TOKEN)
      return res.json({ 'hub.challenge': req.query['hub.challenge'] });
    return res.status(403).end();
  }
  const e = req.body || {};
  if (e.object_type === 'activity' && e.aspect_type === 'create') {
    const r = await L.getRunner(e.owner_id);
    if (r) { try { await L.checkActivity(r, e.object_id); } catch (err) {} }
  }
  res.status(200).end();
};
