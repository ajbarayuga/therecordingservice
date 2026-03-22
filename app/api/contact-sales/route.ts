import { NextResponse } from "next/server";
import { Resend } from "resend";
import { QuoteFormSchema } from "@/schema/quote";

const resend = new Resend(process.env.RESEND_API_KEY);

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: Request) {
  // ── Env guards ────────────────────────────────────────────────────────────
  if (!process.env.RESEND_API_KEY) {
    console.error("[send-quote] RESEND_API_KEY is not set");
    return errorResponse("Email service is not configured", 503);
  }
  const recipientEmail = process.env.SALES_EMAIL;
  if (!recipientEmail) {
    console.error("[send-quote] SALES_EMAIL env var is not set");
    return errorResponse("Recipient email is not configured", 503);
  }

  // ── Parse body ────────────────────────────────────────────────────────────
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse("Invalid JSON body", 400);
  }

  // ── Validate with Zod ─────────────────────────────────────────────────────
  const result = QuoteFormSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        fieldErrors: result.error.flatten().fieldErrors,
      },
      { status: 422 },
    );
  }

  const data = result.data;

  // ── Guard: delivery email must be present ─────────────────────────────────
  if (!data.deliveryEmail) {
    return errorResponse("A delivery email address is required", 422);
  }

  // ── Build email body ──────────────────────────────────────────────────────
  const isSpec = data.isSpecQuote ? "SPEC QUOTE" : "REAL SALE";

  const lines: string[] = [
    `=== NEW QUOTE REQUEST (${isSpec}) ===`,
    "",
    `Event: ${data.eventName ?? "Untitled"}`,
    `Venue: ${data.venueName ?? "TBD"}`,
    `Type: ${data.eventType}`,
    `Date: ${data.hasDate && data.eventDate ? data.eventDate : "TBD"}`,
    "",
    "--- SERVICES ---",
    `Services: ${data.services.join(", ") || "None"}`,
    `Video Types: ${data.videoTypes.join(", ") || "None"}`,
    "",
    "--- CONTACT ---",
    `Delivery Email: ${data.deliveryEmail}`,
  ];

  if (!data.isSpecQuote) {
    lines.push(
      `Client Name: ${data.clientName ?? ""}`,
      `Phone: ${data.clientPhone ?? ""}`,
      `Organization: ${data.organization ?? ""}`,
    );
    if (data.hasAdditionalPOC && data.additionalPOC) {
      lines.push(`Additional POC: ${data.additionalPOC}`);
    }
  }

  if (data.newsletterConsent) {
    lines.push("", "✅ Opted in to newsletter");
  }

  if (data.feedback) {
    lines.push("", `--- FEEDBACK ---`, data.feedback);
  }

  const emailText = lines.join("\n");

  // ── Send ──────────────────────────────────────────────────────────────────
  try {
    // 1. Notify sales team
    const { error: salesError } = await resend.emails.send({
      from: process.env.FROM_EMAIL ?? "onboarding@resend.dev",
      to: [recipientEmail],
      replyTo: data.deliveryEmail,
      subject: `[New Quote] ${data.eventName ?? "Untitled"} — ${isSpec}`,
      text: emailText,
    });

    if (salesError) {
      console.error("[send-quote] Resend error (sales):", salesError);
      return errorResponse(salesError.message, 502);
    }

    // 2. Send a copy to the client's requested delivery email
    const { error: clientError } = await resend.emails.send({
      from: process.env.FROM_EMAIL ?? "onboarding@resend.dev",
      to: [data.deliveryEmail],
      subject: `Your Quote — ${data.eventName ?? "Untitled"}`,
      text: [
        `Hi${data.clientName ? ` ${data.clientName}` : ""},`,
        "",
        "Thanks for using The Recording Service quote tool. Here's a copy of your estimate details:",
        "",
        emailText,
        "",
        "A producer will review this and get back to you shortly.",
        "",
        "— The Recording Service Team",
      ].join("\n"),
    });

    if (clientError) {
      // Non-fatal: sales email already sent. Log and continue.
      console.warn("[send-quote] Resend error (client copy):", clientError);
    }

    return NextResponse.json({ message: "Success" });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[send-quote] Unexpected error:", message);
    return errorResponse("Internal Server Error", 500);
  }
}
