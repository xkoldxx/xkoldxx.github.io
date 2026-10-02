const NEEDS = [
  'Free IT review for my business',
  'A new or better website',
  'Ongoing IT support',
  'Using AI tools safely',
  'Engineering project or contract work',
  'Something else',
];
const MAX_BYTES = 20_000;
const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const json = (status, body) => Response.json(body, { status });

export const onRequest = () => json(405, { ok: false, error: 'Method not allowed' });

export async function onRequestPost({ request, env }) {
  if (Number(request.headers.get('content-length') || 0) > MAX_BYTES) return json(413, { ok: false, error: 'Too large' });
  const buf = await request.arrayBuffer();
  if (buf.byteLength > MAX_BYTES) return json(413, { ok: false, error: 'Too large' });

  const type = request.headers.get('content-type') || '';
  let data;
  try {
    data = type.includes('application/json')
      ? JSON.parse(new TextDecoder().decode(buf))
      : Object.fromEntries(await new Response(buf, { headers: { 'content-type': type } }).formData());
  } catch {
    return json(400, { ok: false, error: 'Bad body' });
  }
  const field = (k) => (typeof data?.[k] === 'string' ? data[k].trim() : '');

  if (field('company_website')) return json(200, { ok: true });

  const lead = { name: field('name'), email: field('email'), need: field('need'), message: field('message') };
  const error =
    (!lead.name || lead.name.length > 100 || /[\r\n]/.test(lead.name)) ? 'Invalid name'
    : (lead.email.length > 254 || !EMAIL_RE.test(lead.email)) ? 'Invalid email'
    : !NEEDS.includes(lead.need) ? 'Invalid need'
    : (lead.message.length < 10 || lead.message.length > 5000) ? 'Invalid message'
    : null;
  if (error) return json(400, { ok: false, error });

  const token = field('cf-turnstile-response');
  if (!token || !(await turnstileOk(env, token, request.headers.get('CF-Connecting-IP')))) {
    return json(403, { ok: false, error: 'Captcha failed' });
  }

  const results = await Promise.allSettled([sendTelegram(env, lead), sendEmail(env, lead)]);
  results.forEach((r, i) => r.status === 'rejected' && console.error(`${['telegram', 'email'][i]} delivery failed:`, r.reason?.message || r.reason));
  return results.some((r) => r.status === 'fulfilled') ? json(200, { ok: true }) : json(502, { ok: false, error: 'Delivery failed' });
}

async function turnstileOk(env, token, ip) {
  const body = new FormData();
  body.append('secret', env.TURNSTILE_SECRET);
  body.append('response', token);
  if (ip) body.append('remoteip', ip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
  const out = await res.json().catch(() => ({}));
  if (!out.success) console.error('turnstile rejected:', out['error-codes']);
  return out.success === true;
}

// ponytail: plain text, no parse_mode, so user input needs no escaping. Telegram caps at 4096 chars; email carries the full text.
async function sendTelegram(env, { name, email, need, message }) {
  const text = `New neit.tech lead\nName: ${name}\nEmail: ${email}\nNeed: ${need}\n\n${message}`.slice(0, 4096);
  const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      chat_id: env.TELEGRAM_CHAT_ID,
      message_thread_id: Number(env.TELEGRAM_THREAD_ID),
      text,
      link_preview_options: { is_disabled: true },
    }),
  });
  const out = await res.json().catch(() => ({}));
  if (!out.ok) throw new Error(`telegram ${res.status}: ${out.description || 'no description'}`);
}

const USING = ['urn:ietf:params:jmap:core', 'urn:ietf:params:jmap:mail', 'urn:ietf:params:jmap:submission'];

async function sendEmail(env, { name, email, need, message }) {
  const headers = { authorization: `Bearer ${env.FASTMAIL_API_TOKEN}`, 'content-type': 'application/json' };
  const sres = await fetch('https://api.fastmail.com/jmap/session', { headers });
  if (!sres.ok) throw new Error(`jmap session ${sres.status}`);
  const { apiUrl, primaryAccounts } = await sres.json();
  const accountId = primaryAccounts['urn:ietf:params:jmap:mail'];
  const call = async (methodCalls) => {
    const res = await fetch(apiUrl, { method: 'POST', headers, body: JSON.stringify({ using: USING, methodCalls }) });
    if (!res.ok) throw new Error(`jmap api ${res.status}`);
    const { methodResponses } = await res.json();
    const err = methodResponses.find(([n]) => n === 'error');
    if (err) throw new Error(`jmap error: ${JSON.stringify(err[1])}`);
    return methodResponses.map(([, args]) => args);
  };

  const [mailboxes, identities] = await call([
    ['Mailbox/query', { accountId, filter: { role: 'drafts' } }, 'm'],
    ['Identity/get', { accountId, ids: null }, 'i'],
  ]);
  const draftsId = mailboxes.ids[0];
  const identity = identities.list.find((i) => i.email.toLowerCase() === env.LEAD_TO.toLowerCase());
  if (!draftsId || !identity) throw new Error('jmap: drafts mailbox or LEAD_TO identity not found');

  // ponytail: onSuccessDestroyEmail like Fastmail's sample; the lead lands in the inbox, no Sent copy kept.
  const [set, sub] = await call([
    ['Email/set', { accountId, create: { lead: {
      mailboxIds: { [draftsId]: true },
      keywords: { $draft: true, $seen: true },
      from: [{ name: 'neit.tech contact form', email: identity.email }],
      to: [{ email: env.LEAD_TO }],
      replyTo: [{ name, email }],
      subject: `neit.tech lead: ${need} — ${name}`,
      bodyValues: { body: { value: `Name: ${name}\nEmail: ${email}\nNeed: ${need}\n\n${message}\n` } },
      textBody: [{ partId: 'body', type: 'text/plain' }],
    } } }, 'e'],
    ['EmailSubmission/set', { accountId, create: { send: { identityId: identity.id, emailId: '#lead' } }, onSuccessDestroyEmail: ['#send'] }, 's'],
  ]);
  if (set.notCreated || sub.notCreated) throw new Error(`jmap not created: ${JSON.stringify(set.notCreated || sub.notCreated)}`);
}
