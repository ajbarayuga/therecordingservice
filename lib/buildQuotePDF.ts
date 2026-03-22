// Client-side only — uses jsPDF to produce real PDF bytes.
// Run: npm install jspdf jspdf-autotable
// Types: npm install --save-dev @types/jspdf-autotable  (optional)

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { QuoteFormData } from "@/schema/quote";
import { LineItem } from "@/lib/calculateSOW";

// ─── tiny helpers ─────────────────────────────────────────────────────────────

function orDash(v: string | string[] | undefined | null): string {
  if (!v) return "—";
  if (Array.isArray(v)) return v.length ? v.join(", ") : "—";
  return v.trim() || "—";
}
function yesNo(v: boolean | undefined) {
  return v ? "Yes" : "No";
}

// ─── colour constants ─────────────────────────────────────────────────────────

const BLACK = [15, 15, 15] as [number, number, number];
const WHITE = [255, 255, 255] as [number, number, number];
const GREY = [245, 245, 245] as [number, number, number];
const MID = [120, 120, 120] as [number, number, number];
const LIGHT = [220, 220, 220] as [number, number, number];

// ─── page helpers ─────────────────────────────────────────────────────────────

const PW = 210; // A4 width mm
const PH = 297; // A4 height mm
const ML = 20; // margin left
const MR = 20; // margin right
const CW = PW - ML - MR; // content width

function pageHeader(doc: jsPDF, title: string) {
  // top bar
  doc.setFillColor(...BLACK);
  doc.rect(0, 0, PW, 14, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...WHITE);
  doc.text("THE RECORDING SERVICE", ML, 9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...MID);
  // right-align the section title
  doc.text(title.toUpperCase(), PW - MR, 9, { align: "right" });
  doc.setTextColor(...BLACK);
}

function sectionLabel(doc: jsPDF, label: string, y: number): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...MID);
  doc.text(label.toUpperCase(), ML, y);
  doc.setDrawColor(...LIGHT);
  doc.line(ML, y + 1.5, ML + CW, y + 1.5);
  doc.setTextColor(...BLACK);
  return y + 7;
}

// Draw a question (bold) + answer pair; returns next Y
function qa(doc: jsPDF, question: string, answer: string, y: number): number {
  const lineH = 5;
  // question
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(question, ML, y);
  y += lineH;
  // answer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const lines = doc.splitTextToSize(answer, CW);
  doc.text(lines, ML + 4, y);
  y += lines.length * lineH + 2;
  return y;
}

// ─── main export ──────────────────────────────────────────────────────────────

export function buildQuotePDF(
  data: QuoteFormData,
  items: LineItem[],
  subtotal: number,
): Uint8Array {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const now = new Date().toLocaleString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const tag = data.isSpecQuote ? "SPEC QUOTE" : "REAL SALE";
  const eventName = data.eventName ?? "Untitled Event";

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 1 — COVER
  // ══════════════════════════════════════════════════════════════════════════
  doc.setFillColor(...BLACK);
  doc.rect(0, 0, PW, PH, "F");

  // Tag pill
  doc.setDrawColor(...MID);
  doc.setFillColor(40, 40, 40);
  doc.roundedRect(ML, 36, 34, 7, 3, 3, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(...MID);
  doc.text(tag, ML + 17, 41, { align: "center" });

  // Brand
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(100, 100, 100);
  doc.text("THE RECORDING SERVICE", ML, 62);

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(36);
  doc.setTextColor(...WHITE);
  const titleLines: string[] = doc.splitTextToSize("Production\nEstimate", CW);
  doc.text(titleLines, ML, 80);

  // Event name subtitle
  doc.setFont("helvetica", "normal");
  doc.setFontSize(13);
  doc.setTextColor(160, 160, 160);
  doc.text(eventName, ML, 115);

  // Divider
  doc.setDrawColor(50, 50, 50);
  doc.line(ML, 190, ML + CW, 190);

  // Meta grid
  const metaItems: [string, string][] = [
    ["Generated", now],
    ["Venue", orDash(data.venueName)],
    ["Event Date", data.hasDate && data.eventDate ? data.eventDate : "TBD"],
    ["Prepared for", data.deliveryEmail],
  ];
  let mx = ML;
  const metaColW = CW / 2;
  metaItems.forEach(([label, value], i) => {
    const x = mx + (i % 2) * metaColW;
    const y = i < 2 ? 200 : 218;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(80, 80, 80);
    doc.text(label.toUpperCase(), x, y);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(200, 200, 200);
    doc.text(value, x, y + 5);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 2 — TIME & PLACE
  // ══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  pageHeader(doc, "Event Details");

  let y = 24;
  y = sectionLabel(doc, "Time & Place", y);

  const step2: [string, string][] = [
    [
      "Event Type",
      data.eventType === "live"
        ? "Live Event"
        : data.eventType === "studio"
          ? "Studio-Style Recording"
          : "Other",
    ],
    ["Is Multi-Day?", yesNo(data.isMultiDay)],
    ["Venue Type", data.venueType],
    [
      "Location Type",
      data.locationType === "office"
        ? "Own / Office Space"
        : "Rented / 3rd-Party",
    ],
    ["Setting", data.setting === "indoor" ? "Indoor" : "Outdoor"],
    ["Date Confirmed?", data.hasDate ? `Yes — ${data.eventDate ?? ""}` : "TBD"],
    ["Doors Time", orDash(data.doorsTime)],
    [
      "Event Duration",
      data.hasDuration ? `${data.durationHours} hours` : "TBD",
    ],
    ["Venue Built-in AV", orDash(data.builtInAV)],
  ];

  for (const [q, a] of step2) {
    y = qa(doc, q, a, y);
    if (y > PH - 30) {
      doc.addPage();
      pageHeader(doc, "Event Details (cont.)");
      y = 24;
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 3 — SERVICES
  // ══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  pageHeader(doc, "Services");
  y = 24;
  y = sectionLabel(doc, "Selected Services", y);

  const serviceQAs: [string, string][] = [];

  // Streaming
  if (data.services.includes("streaming")) {
    serviceQAs.push(["Live Streaming", "Yes"]);
    serviceQAs.push(["Zoom Only?", yesNo((data as any).isZoomOnly)]);
    serviceQAs.push(["Number of Cameras", orDash(data.cameraCount)]);
    serviceQAs.push([
      "Camera Source",
      data.cameraSource === "built-in"
        ? "Use Venue Built-in"
        : "Bring Own Cameras",
    ]);
    serviceQAs.push(["On-Screen Graphics?", yesNo(data.streamGraphics)]);
    serviceQAs.push(["DIY Stream Link?", yesNo(data.diyStream)]);
  } else {
    serviceQAs.push(["Live Streaming", "No"]);
  }

  // Video
  if (data.services.includes("video")) {
    serviceQAs.push(["Video Production", "Yes"]);
    serviceQAs.push(["Video Types", orDash(data.videoTypes)]);
    if (data.videoTypes.includes("podcast")) {
      serviceQAs.push(["Podcast — Episodes", String(data.podcastEpisodes)]);
      serviceQAs.push([
        "Podcast — Recording Duration (hrs)",
        String(data.podcastDuration),
      ]);
    }
    if (data.videoTypes.includes("web-video")) {
      serviceQAs.push([
        "Web Video — Number of Videos",
        String(data.webVideoCount),
      ]);
      serviceQAs.push([
        "Web Video — Duration per Video (mins)",
        String(data.webVideoDuration),
      ]);
    }
    if (data.videoTypes.includes("highlight")) {
      serviceQAs.push([
        "Event Highlight — Duration (hrs)",
        String(data.highlightDurationHours),
      ]);
    }
    if (data.videoTypes.includes("lecture")) {
      serviceQAs.push([
        "Lecture — Number of Talks",
        String(data.lectureTalksCount),
      ]);
      serviceQAs.push([
        "Lecture — Duration per Talk",
        orDash(data.lectureTalkDuration),
      ]);
      serviceQAs.push(["Lecture — Has PPT Slides?", yesNo(data.lecturePPT)]);
    }
  } else {
    serviceQAs.push(["Video Production", "No"]);
  }

  // Social Shorts
  if ((data as any).wantsSocialShorts || data.socialShortsCount > 0) {
    serviceQAs.push(["Social Shorts", "Yes"]);
    serviceQAs.push(["Number of Shorts", String(data.socialShortsCount)]);
    serviceQAs.push([
      "Shorts Source",
      data.shortsSource === "filming"
        ? "Film Additional Footage"
        : "Recut Existing Material",
    ]);
  } else {
    serviceQAs.push(["Social Shorts", "No"]);
  }

  for (const [q, a] of serviceQAs) {
    y = qa(doc, q, a, y);
    if (y > PH - 30) {
      doc.addPage();
      pageHeader(doc, "Services (cont.)");
      y = 24;
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 4 — CONTACT + BREAKDOWN
  // ══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  pageHeader(doc, "Contact & Breakdown");
  y = 24;
  y = sectionLabel(doc, "Contact Details", y);

  const contactQAs: [string, string][] = [
    ["Event Name", orDash(data.eventName)],
    ["Venue Name", orDash(data.venueName)],
    ["Quote Type", tag],
    ...(!data.isSpecQuote
      ? [
          ["Client Name", orDash(data.clientName)] as [string, string],
          ["Phone", orDash(data.clientPhone)] as [string, string],
          ["Organisation", orDash(data.organization)] as [string, string],
          ...(data.hasAdditionalPOC
            ? [
                ["Additional POC", orDash(data.additionalPOC)] as [
                  string,
                  string,
                ],
              ]
            : []),
        ]
      : []),
    ["Delivery Email", data.deliveryEmail],
    ["Newsletter Opt-in", yesNo(data.newsletterConsent)],
    ...(data.feedback ? [["Feedback", data.feedback] as [string, string]] : []),
  ];

  for (const [q, a] of contactQAs) {
    y = qa(doc, q, a, y);
    if (y > PH - 80) {
      doc.addPage();
      pageHeader(doc, "Contact (cont.)");
      y = 24;
    }
  }

  // ── Cost breakdown table ─────────────────────────────────────────────────
  y += 4;
  y = sectionLabel(doc, "Cost Breakdown", y);

  autoTable(doc, {
    startY: y,
    margin: { left: ML, right: MR },
    head: [["Service", "Description", "Qty", "Rate (₱)", "Amount (₱)"]],
    body: items.map((item) => [
      item.name,
      item.description,
      `${item.quantity} ${item.unit}`,
      item.rate.toLocaleString(),
      item.total.toLocaleString(),
    ]),
    headStyles: {
      fillColor: BLACK,
      textColor: WHITE,
      fontSize: 7,
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 8,
      textColor: BLACK,
    },
    alternateRowStyles: {
      fillColor: GREY,
    },
    columnStyles: {
      0: { cellWidth: 42 },
      1: { cellWidth: 58 },
      2: { halign: "right", cellWidth: 20 },
      3: { halign: "right", cellWidth: 25 },
      4: { halign: "right", cellWidth: 25, fontStyle: "bold" },
    },
  });

  // ── Total box ─────────────────────────────────────────────────────────────
  const afterTable = (doc as any).lastAutoTable.finalY + 6;
  doc.setFillColor(...BLACK);
  doc.roundedRect(ML, afterTable, CW, 18, 3, 3, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  doc.text(
    "ESTIMATED INVESTMENT · VAT INCLUSIVE · PENDING REVIEW",
    ML + 6,
    afterTable + 7,
  );
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...WHITE);
  doc.text(`₱${subtotal.toLocaleString()}`, PW - MR - 6, afterTable + 12, {
    align: "right",
  });

  // ── Footer note ────────────────────────────────────────────────────────
  const footerY = afterTable + 26;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(170, 170, 170);
  doc.text(
    "Final Run of Show must be submitted 3 days prior. Broken built-in venue tech requires a revised quote.\nThis is an automated estimate. A producer will confirm details within 24 hours.",
    ML,
    footerY,
    { maxWidth: CW },
  );

  return doc.output("arraybuffer") as unknown as Uint8Array;
}
