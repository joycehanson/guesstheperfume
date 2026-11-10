// Personal share pages for Guess the Perfume.
// perfume.studiohans.agency/r/<id> (and the older share.studiohans.agency/r/<id>) returns a tiny page whose preview tags point to that
// player's result card, so X, WhatsApp, iMessage and others show it. People who open
// the link are sent straight to the game.
const SUPABASE = 'https://oxhctjefjcoqdiyqeuwn.supabase.co';
const KEY = 'sb_publishable_XiZkUBVbue3ZR3_ejL80bQ_RMorZqTg'; // public key, read only here
const GAME = 'https://perfume.studiohans.agency/';
const MODES = { house: 'Name the House', scent: 'Name the Scent', daily: 'the Daily bottle' };

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

module.exports = async (req, res) => {
  const id = String((req.query && req.query.id) || '').toLowerCase();
  let row = null;
  if (/^[a-z0-9]{8,16}$/.test(id)) {
    try {
      const r = await fetch(`${SUPABASE}/rest/v1/shares?id=eq.${id}&select=id,name,score,mode,tier,right_count,total`, { headers: { apikey: KEY } });
      const j = await r.json();
      row = Array.isArray(j) && j[0] ? j[0] : null;
    } catch (e) {}
  }
  const who = row && row.name ? row.name : 'A player';
  const title = row ? `${who} scored ${Number(row.score).toLocaleString('en-US')} points on Guess the Perfume` : 'Guess the Perfume: How well do you know your bottles?';
  const desc = row
    ? `${row.right_count}/${row.total} bottles in ${MODES[row.mode] || 'the game'}, ranked "${row.tier}". Think your nose can beat it?`
    : 'A fragrance quiz with the label hidden. Name the house or the exact perfume in ten rounds, try the daily bottle and climb the leaderboard.';
  const image = row ? `${SUPABASE}/storage/v1/object/public/cards/${row.id}.jpg` : `${GAME}og-image.png`;
  const url = row ? `${GAME}r/${row.id}` : GAME;
  const target = `${GAME}?ref=share`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', row ? 'public, max-age=300, s-maxage=86400' : 'public, max-age=60');
  res.status(200).send(`<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Guess the Perfume">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${esc(image)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${esc(image)}">
<meta http-equiv="refresh" content="0; url=${esc(target)}">
<meta name="theme-color" content="#2A0A10">
</head><body style="margin:0;background:#2A0A10;color:#F1E6D6;font-family:Georgia,serif;display:flex;align-items:center;justify-content:center;height:100vh">
<a href="${esc(target)}" style="color:#F1E6D6">Play Guess the Perfume</a>
<script>location.replace(${JSON.stringify(target)})</script>
</body></html>`);
};
