import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

const cookie = '__Host-fundacao-cms';
const encode = value => JSON.stringify(value).replace(/</g, '\\u003c');
const cookieOptions = '; Path=/; HttpOnly; Secure; SameSite=Lax';

export default async function handler(req, res, callback = false) {
  const {CMS_ORIGIN: origin, CMS_GITHUB_CLIENT_ID: clientId,
    CMS_GITHUB_CLIENT_SECRET: clientSecret, CMS_GITHUB_EDITORS: editors} = process.env;
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'GET') return res.status(405).end();
  if (!origin || !clientId || !clientSecret || !editors) {
    return res.status(503).send('O acesso ao painel ainda não foi configurado.');
  }

  const url = new URL(req.url, origin);
  if (req.headers.host !== new URL(origin).host) {
    return res.status(403).send('Abra o painel no endereço oficial da Fundação.');
  }
  const registeredCallback = origin + '/api/cms-callback';
  if (callback !== true) {
    const state = randomBytes(32).toString('base64url');
    const verifier = randomBytes(32).toString('base64url');
    res.setHeader('Set-Cookie', cookie + '=' + state + '.' + verifier + cookieOptions + '; Max-Age=600');
    const query = new URLSearchParams({
      client_id: clientId, redirect_uri: registeredCallback, scope: 'public_repo', state,
      code_challenge: createHash('sha256').update(verifier).digest('base64url'), code_challenge_method: 'S256'
    });
    res.setHeader('Location', 'https://github.com/login/oauth/authorize?' + query);
    return res.status(302).end();
  }
  const stored = req.headers.cookie?.split('; ').find(part => part.startsWith(cookie + '='))?.split('=')[1];
  const [expected = '', verifier = ''] = (stored ?? '').split('.');
  const state = url.searchParams.get('state') ?? '';
  const code = url.searchParams.get('code');
  if (!code || !/^[\w-]{43}$/.test(state) || !/^[\w-]{43}$/.test(expected) ||
      !/^[\w-]{43}$/.test(verifier) || !timingSafeEqual(Buffer.from(state), Buffer.from(expected))) {
    return res.status(400).send('Sessão de acesso inválida. Volte ao painel e tente novamente.');
  }
  res.setHeader('Set-Cookie', cookie + '=' + cookieOptions + '; Max-Age=0');

  try {
    const result = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {Accept:'application/json'},
      body: new URLSearchParams({
        client_id: clientId, client_secret: clientSecret, code,
        redirect_uri: registeredCallback, code_verifier: verifier
      }),
      signal: AbortSignal.timeout(8000)
    });
    const {access_token: token} = await result.json();
    if (!result.ok || !token) return res.status(403).send('O GitHub não autorizou o acesso.');
    const headers = {Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json'};
    const [userResponse, repoResponse] = await Promise.all([
      fetch('https://api.github.com/user', {headers, signal: AbortSignal.timeout(8000)}),
      fetch('https://api.github.com/repos/d2000video-design/centro-social', {headers, signal: AbortSignal.timeout(8000)})
    ]);
    const [user, repo] = await Promise.all([userResponse.json(), repoResponse.json()]);
    const allowed = editors.toLowerCase().split(',').map(login => login.trim());
    if (!userResponse.ok || !repoResponse.ok || !allowed.includes(user.login?.toLowerCase()) || !repo.permissions?.push) {
      return res.status(403).send('Esta conta não tem permissão para editar o site.');
    }
    const nonce = randomBytes(18).toString('base64');
    res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'; script-src 'nonce-" + nonce + "'");
    return res.status(200).send('<!doctype html><meta charset="utf-8"><title>Acesso ao painel</title>' +
      '<p>Pode voltar ao painel da Fundação.</p><script nonce="' + nonce + '">' +
      'const origin=' + encode(origin) + ';' +
      'function complete(event){if(event.origin!==origin||event.source!==window.opener)return;' +
      'window.removeEventListener("message",complete);window.opener.postMessage(' +
      encode('authorization:github:success:' + JSON.stringify({token, provider:'github'})) + ',origin);}' +
      'if(window.opener){window.addEventListener("message",complete);' +
      'window.opener.postMessage("authorizing:github",origin);}</script>');
  } catch {
    return res.status(502).send('Não foi possível confirmar o acesso com o GitHub. Tente novamente.');
  }
}
