import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/* ─────────────────────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────────────────────── */

interface WaitlistBody {
  firstName: string;
  lastName: string;
  email: string;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Confirmation email
   ─────────────────────────────────────────────────────────────────────────────
   Sent via Resend (https://resend.com) — the standard transactional email
   provider for Next.js / Vercel projects.

   Setup:
     1. npm install resend   (or: yarn add resend)
     2. Add to .env.local:
          RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
          RESEND_FROM_EMAIL=noreply@yourdomain.com   ← must be a verified domain
     3. Verify your sending domain in the Resend dashboard.

   If RESEND_API_KEY is absent the function logs a warning and returns early —
   registration still succeeds so the missing env var never surfaces as a user-
   facing error.
───────────────────────────────────────────────────────────────────────────── */

async function sendConfirmationEmail(
  firstName: string,
  email: string
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress =
    process.env.RESEND_FROM_EMAIL ?? "noreply@cranecoregroup.com";

  if (!apiKey) {
    console.warn(
      "[waitlist] RESEND_API_KEY is not set — skipping confirmation email."
    );
    return;
  }

  const year = new Date().getFullYear();

  const html = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Waitlist confirmed — Crane Core Group</title>
  <!--[if mso]>
  <noscript>
    <xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml>
  </noscript>
  <![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #04060e;
      font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      -webkit-font-smoothing: antialiased;
      color: #e8ecf8;
    }
    a { color: inherit; text-decoration: none; }
    @media (prefers-color-scheme: dark) {
      body { background-color: #04060e !important; }
    }
  </style>
</head>
<body style="background-color:#04060e;margin:0;padding:0;">

  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
    style="background-color:#04060e;padding:48px 16px;">
    <tr>
      <td align="center">

        <!-- Content column -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
          style="max-width:520px;width:100%;">

          <!-- ── Logo row ── -->
          <tr>
            <td style="padding-bottom:28px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-right:10px;vertical-align:middle;">
                    <!--[if gte mso 9]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml"
                      xmlns:o="urn:schemas-microsoft-com:office:office"
                      style="height:32px;width:32px;" arcsize="22%"
                      strokecolor="#ffffff22" fillcolor="#0d1020">
                    </v:roundrect><![endif]-->
                    <div style="width:32px;height:32px;background:#0d1020;border:1px solid rgba(255,255,255,0.1);border-radius:7px;text-align:center;line-height:32px;">
                      <svg width="18" height="18" viewBox="0 0 32 32" fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style="vertical-align:middle;display:inline-block;">
                        <line x1="10" y1="25" x2="10" y2="9" stroke="rgba(255,255,255,0.88)" stroke-width="1.6" stroke-linecap="round"/>
                        <line x1="10" y1="9" x2="24" y2="9" stroke="rgba(255,255,255,0.88)" stroke-width="1.6" stroke-linecap="round"/>
                        <line x1="10" y1="9" x2="6" y2="9" stroke="rgba(255,255,255,0.4)" stroke-width="1.2" stroke-linecap="round"/>
                        <line x1="24" y1="9" x2="24" y2="14" stroke="rgba(255,255,255,0.88)" stroke-width="1.6" stroke-linecap="round"/>
                        <path d="M 24 14 Q 24 17 21.5 17" stroke="rgba(255,255,255,0.88)" stroke-width="1.4" fill="none" stroke-linecap="round"/>
                        <line x1="6.5" y1="25" x2="13.5" y2="25" stroke="rgba(255,255,255,0.88)" stroke-width="1.6" stroke-linecap="round"/>
                        <circle cx="24" cy="9" r="1.5" fill="rgba(232,168,48,0.85)"/>
                      </svg>
                    </div>
                  </td>
                  <td style="vertical-align:middle;">
                    <span style="font-size:13px;font-weight:600;letter-spacing:-0.02em;color:rgba(240,244,255,0.88);">
                      Crane Core Group
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── Card ── -->
          <tr>
            <td style="
              background:linear-gradient(160deg,rgba(255,255,255,0.038) 0%,rgba(255,255,255,0.012) 100%);
              border:1px solid rgba(255,255,255,0.07);
              border-radius:18px;
              padding:32px 32px 28px;
            ">

              <!-- Label -->
              <p style="
                margin:0 0 14px;
                font-size:10px;
                font-weight:500;
                letter-spacing:0.2em;
                text-transform:uppercase;
                color:rgba(200,214,240,0.28);
              ">
                Waitlist confirmed
              </p>

              <!-- Headline -->
              <h1 style="
                margin:0 0 18px;
                font-size:26px;
                font-weight:600;
                letter-spacing:-0.03em;
                line-height:1.1;
                color:#f0f4ff;
              ">
                You are on the list, ${firstName}.
              </h1>

              <!-- Amber divider line -->
              <div style="
                width:40px;height:2px;
                background:linear-gradient(90deg,rgba(232,168,48,0.7),rgba(232,168,48,0.2));
                border-radius:2px;
                margin-bottom:20px;
              "></div>

              <!-- Body -->
              <p style="
                margin:0 0 16px;
                font-size:14px;
                line-height:1.7;
                font-weight:300;
                color:rgba(220,228,245,0.5);
              ">
                Thank you for your interest in Crane Core Group. We are building AI systems that transform construction blueprints and floor plans into actionable intelligence — automating planning, estimation, and execution for modern infrastructure teams.
              </p>

              <p style="
                margin:0 0 24px;
                font-size:14px;
                line-height:1.7;
                font-weight:300;
                color:rgba(220,228,245,0.5);
              ">
                We will contact you directly when early access becomes available for your organisation. There is nothing further required from you at this stage.
              </p>

              <!-- Divider -->
              <div style="
                border-top:1px solid rgba(255,255,255,0.06);
                padding-top:20px;
                margin-top:4px;
              ">
                <p style="
                  margin:0;
                  font-size:11.5px;
                  line-height:1.6;
                  color:rgba(200,214,240,0.22);
                ">
                  This message was sent to
                  <span style="color:rgba(220,228,245,0.45);">${email}</span>
                  because you submitted a request on the Crane Core Group waitlist.
                  If this was not you, you may safely disregard this email.
                </p>
              </div>

            </td>
          </tr>

          <!-- ── Footer ── -->
          <tr>
            <td style="padding-top:24px;text-align:center;">
              <p style="
                margin:0;
                font-size:11px;
                color:rgba(200,214,240,0.18);
                letter-spacing:0.02em;
              ">
                © ${year} Crane Core Group &nbsp;&middot;&nbsp; Designing the future of infrastructure
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;

  const text = `
Crane Core Group — Waitlist Confirmed

You are on the list, ${firstName}.

Thank you for your interest in Crane Core Group. We are building AI systems that transform construction blueprints and floor plans into actionable intelligence — automating planning, estimation, and execution for modern infrastructure teams.

We will contact you directly when early access becomes available. There is nothing further required from you at this stage.

---
This message was sent to ${email} because you submitted a request on the Crane Core Group waitlist.
© ${year} Crane Core Group
`.trim();

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `Crane Core Group <${fromAddress}>`,
      to: [email],
      subject: "You are on the waitlist — Crane Core Group",
      html,
      text,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "(unreadable)");
    console.error(
      `[waitlist] Resend API returned ${response.status}: ${body}`
    );
    // Do not throw — email failure must not cause the registration to fail.
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   Input sanitisation
───────────────────────────────────────────────────────────────────────────── */

function sanitiseString(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, 200);
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidName(name: string): boolean {
  return name.length >= 2 && /^[A-Za-zÀ-ÿ'\- ]+$/.test(name);
}

/* ─────────────────────────────────────────────────────────────────────────────
   POST /api/waitlist
───────────────────────────────────────────────────────────────────────────── */

export async function POST(req: Request): Promise<NextResponse> {
  // ── Parse body ────────────────────────────────────────────────────────────
  let body: Partial<WaitlistBody>;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  // ── Sanitise ──────────────────────────────────────────────────────────────
  const firstName = sanitiseString(body.firstName);
  const lastName = sanitiseString(body.lastName);
  const email = sanitiseString(body.email).toLowerCase();

  // ── Server-side validation ────────────────────────────────────────────────
  if (!firstName || !lastName || !email) {
    return NextResponse.json(
      { error: "All fields are required." },
      { status: 400 }
    );
  }

  if (!isValidName(firstName) || !isValidName(lastName)) {
    return NextResponse.json(
      { error: "Names must be 2–40 letters only." },
      { status: 400 }
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 }
    );
  }

  // ── Insert into Supabase ──────────────────────────────────────────────────
  const { error: dbError } = await supabase.from("waitlist").insert([
    {
      first_name: firstName,
      last_name: lastName,
      email,
    },
  ]);

  if (dbError) {
    // Unique constraint violation — duplicate email
    if (dbError.code === "23505") {
      return NextResponse.json(
        { error: "This email is already on the waitlist." },
        { status: 409 }
      );
    }

    console.error("[waitlist] Supabase insert error:", dbError);
    return NextResponse.json(
      { error: "A database error occurred. Please try again." },
      { status: 500 }
    );
  }

  // ── Send confirmation email (non-blocking) ────────────────────────────────
  // We deliberately do not await this so that a slow or failed email send
  // never delays or breaks the HTTP response to the client.
  sendConfirmationEmail(firstName, email).catch((err) => {
    console.error("[waitlist] Confirmation email failed:", err);
  });

  // ── Success ───────────────────────────────────────────────────────────────
  return NextResponse.json(
    { message: "Successfully joined the waitlist." },
    { status: 200 }
  );
}