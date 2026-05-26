// Cloudflare Worker: returns HTTP 410 Gone for /my-account.
// Deploy: dashboard → Workers & Pages → Create Worker → paste this →
// then Workers Routes → add route: lucawetherall.co.uk/my-account*
//
// 410 (vs 404) signals to Google that the page is *intentionally* gone and
// should be deindexed faster. The body is plain HTML so direct visitors see
// a readable explanation rather than a blank error.

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === '/my-account' || url.pathname.startsWith('/my-account/')) {
      return new Response(
        `<!doctype html>
<html lang="en-GB"><head><meta charset="utf-8"><title>Page removed</title>
<meta name="robots" content="noindex"></head>
<body style="font-family:system-ui;max-width:40rem;margin:4rem auto;padding:0 1rem">
<h1>This page no longer exists</h1>
<p>The account area has been retired. Visit
<a href="https://lucawetherall.co.uk/">lucawetherall.co.uk</a>
or <a href="https://lucawetherall.co.uk/contact/">get in touch</a>.</p>
</body></html>`,
        { status: 410, headers: { 'content-type': 'text/html; charset=utf-8' } }
      );
    }
    return fetch(request);
  },
};
