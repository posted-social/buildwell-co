/**
 * Cloudflare Pages Function — POST /api/contact
 * Sends the consultation request through Resend.
 *
 * Required environment variables (Pages project → Settings → Variables and Secrets):
 *   RESEND_API_KEY   your Resend key (re_...). Add it as a Secret, never in client code.
 *   CONTACT_TO       where leads go, e.g. "buildwellandco@gmail.com"
 *   CONTACT_FROM     a sender on a domain verified in Resend, e.g. "Buildwell & Co <leads@buildwellandco.com>"
 *                    Until a domain is verified, "onboarding@resend.dev" works but can only
 *                    deliver to the email address on the Resend account.
 */

const ALLOWED_PROJECTS = new Set([
  'Kitchen remodel', 'Bathroom remodel', 'Home addition', 'Deck or outdoor', 'Basement finish', 'Something else',
]);
const ALLOWED_TIMELINES = new Set(['As soon as possible', 'Within 3 months', '3–6 months', 'Just planning']);

export async function onRequestPost({ request, env }) {
  const missing = ['RESEND_API_KEY', 'CONTACT_TO', 'CONTACT_FROM'].filter((k) => !env[k]);
  if (missing.length) {
    return json({ ok: false, error: 'Server is not configured: ' + missing.join(', ') }, 500);
  }

  let data;
  try {
    const ct = request.headers.get('content-type') || '';
    data = ct.includes('application/json')
      ? await request.json()
      : Object.fromEntries((await request.formData()).entries());
  } catch {
    return json({ ok: false, error: 'Could not read the form.' }, 400);
  }

  // Honeypot: real users never fill this hidden field.
  if (data.company) return json({ ok: true });

  const name = clean(data.Name ?? data.name, 120);
  const phone = clean(data.Phone ?? data.phone, 40);
  const email = clean(data.Email ?? data.email, 200);
  const project = clean(data.Project ?? data.project, 60);
  const timeline = clean(data.Timeline ?? data.timeline, 60);
  const details = clean(data.Details ?? data.details, 4000);

  if (!name || !phone) return json({ ok: false, error: 'Name and phone are required.' }, 400);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ ok: false, error: 'That email address does not look right.' }, 400);
  }
  const projectLabel = ALLOWED_PROJECTS.has(project) ? project : 'Not specified';
  const timelineLabel = ALLOWED_TIMELINES.has(timeline) ? timeline : 'Not specified';

  const rows = [
    ['Name', name], ['Phone', phone], ['Email', email || '—'],
    ['Project type', projectLabel], ['Ideal start', timelineLabel],
  ]
    .map(([k, v]) => `<tr><td style="padding:6px 12px 6px 0;color:#66705F;white-space:nowrap">${k}</td><td style="padding:6px 0">${esc(v)}</td></tr>`)
    .join('');

  const html = `
    <div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;font-size:15px;color:#1F2320;line-height:1.5">
      <h2 style="margin:0 0 16px;font-size:20px">New consultation request</h2>
      <table style="border-collapse:collapse">${rows}</table>
      <h3 style="margin:20px 0 8px;font-size:15px">Project details</h3>
      <p style="white-space:pre-wrap;margin:0">${esc(details) || '—'}</p>
      <p style="margin:24px 0 0;font-size:12px;color:#66705F">Sent from the Buildwell &amp; Co website contact form.</p>
    </div>`;

  const text = [
    'New consultation request', '',
    `Name: ${name}`, `Phone: ${phone}`, `Email: ${email || '—'}`,
    `Project type: ${projectLabel}`, `Ideal start: ${timelineLabel}`, '',
    'Project details:', details || '—',
  ].join('\n');

  const payload = {
    from: env.CONTACT_FROM,
    to: env.CONTACT_TO.split(',').map((s) => s.trim()).filter(Boolean),
    subject: `New consultation request — ${name} (${projectLabel})`,
    html,
    text,
  };
  if (email) payload.reply_to = email;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    console.error('Resend error', res.status, body);
    return json({ ok: false, error: 'Could not send right now. Call or text (314) 489-6439 instead.' }, 502);
  }
  return json({ ok: true });
}

export function onRequest({ request }) {
  // Anything but POST
  return request.method === 'POST' ? undefined : new Response('Method not allowed', { status: 405 });
}

function clean(v, max) {
  return String(v ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);
}
function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}
