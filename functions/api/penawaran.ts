// Cloudflare Pages Function: POST /api/penawaran
// Sends the corporate catering enquiry by email through Resend when configured.
// Without RESEND_API_KEY it answers 503 and the page falls back to WhatsApp.

interface Env {
  RESEND_API_KEY?: string;
  ENQUIRY_TO?: string;
  ENQUIRY_FROM?: string;
}

interface Ctx {
  request: Request;
  env: Env;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });

const clean = (v: unknown, max: number) => String(v ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max);

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export const onRequestPost = async ({ request, env }: Ctx) => {
  let data: Record<string, unknown>;
  try {
    const type = request.headers.get('content-type') || '';
    data = type.includes('application/json') ? await request.json() : Object.fromEntries(await request.formData());
  } catch {
    return json({ ok: false, error: 'bad-request' }, 400);
  }
  if (clean(data.website, 200)) return json({ ok: true }); // honeypot: pretend success

  const nama = clean(data.nama, 80);
  const perusahaan = clean(data.perusahaan, 120);
  const whatsapp = clean(data.whatsapp, 20);
  const porsi = Number(clean(data.porsi, 7));
  if (!nama || !perusahaan || !/^[0-9+\-\s]{8,20}$/.test(whatsapp) || !Number.isFinite(porsi) || porsi < 1) {
    return json({ ok: false, error: 'invalid' }, 422);
  }
  if (!env.RESEND_API_KEY || !env.ENQUIRY_TO) return json({ ok: false, error: 'not-configured' }, 503);

  const rows = [['Nama', nama], ['Perusahaan', perusahaan], ['WhatsApp', whatsapp], ['Porsi per hari', String(porsi)]];
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      from: env.ENQUIRY_FROM || 'Situs Aroma Langit <situs@aromalangit.id>',
      to: env.ENQUIRY_TO.split(',').map((s) => s.trim()),
      subject: `Penawaran katering kantor: ${perusahaan}`,
      text: rows.map(([k, v]) => `${k}: ${v}`).join('\n'),
      html: `<table>${rows.map(([k, v]) => `<tr><td><b>${k}</b></td><td>${escapeHtml(v)}</td></tr>`).join('')}</table>`,
    }),
  });
  if (!res.ok) return json({ ok: false, error: 'send-failed' }, 502);
  return json({ ok: true });
};

export const onRequest = async () => json({ ok: false, error: 'method-not-allowed' }, 405);
