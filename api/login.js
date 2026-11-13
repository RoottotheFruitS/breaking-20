module.exports = (req, res) => {
  const cb = encodeURIComponent(`https://${req.headers.host}/api/callback`);
  res.redirect(`https://www.strava.com/oauth/authorize?client_id=${process.env.STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${cb}&approval_prompt=auto&scope=activity:read_all`);
};
