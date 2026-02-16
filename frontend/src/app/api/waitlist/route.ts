import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL ?? "waz@canhav.com";

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, notes } = body as { email?: string; notes?: string };

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email is required." },
        { status: 400 }
      );
    }

    const resend = getResend();
    if (!resend) {
      console.log("Waitlist signup (no Resend key):", { email, notes });
      return NextResponse.json({ success: true });
    }

    await resend.emails.send({
      from: "Coffee Beans DAO <onboarding@resend.dev>",
      to: NOTIFY_EMAIL,
      subject: `New Waitlist Signup: ${email}`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px;">
          <h2 style="color: #78350f;">New Waitlist Signup</h2>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Why they want to join:</strong></p>
          <blockquote style="border-left: 3px solid #78350f; padding-left: 12px; color: #444;">
            ${notes ? escapeHtml(notes) : "<em>No notes provided</em>"}
          </blockquote>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 24px 0;" />
          <p style="font-size: 12px; color: #888;">Coffee Beans DAO Waitlist</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Waitlist API error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\n/g, "<br />");
}
