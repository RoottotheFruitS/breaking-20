// One-time setup: visit /api/subscribe?token=<WEBHOOK_VERIFY_TOKEN> to register Strava's webhook.
module.exports = async (req, res) => {
  if (req.query.token !== process.env.WEBHOOK_VERIFY_TOKEN) return res.status(403).send('Forbidden');
  const body = new URLSearchParams({
    client_id: process.env.STRAVA_CLIENT_ID,
    client_secret: process.env.STRAVA_CLIENT_SECRET,
    callback_url: `https://${req.headers.host}/api/webhook`,
    verify_token: process.env.WEBHOOK_VERIFY_TOKEN
  });
  const r = await fetch('https://www.strava.com/api/v3/push_subscriptions', { method: 'POST', body });
  res.status(r.status).json(await r.json());
};
