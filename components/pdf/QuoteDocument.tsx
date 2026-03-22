import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { QuoteFormData } from "@/schema/quote";
import type { LineItem } from "@/lib/calculateSOW";
import { fmt } from "@/lib/utils";
import { CURRENCY } from "@/lib/pricing";

// ─── helpers ──────────────────────────────────────────────────────────────────

function orDash(v: string | string[] | undefined | null): string {
  if (!v) return "—";
  if (Array.isArray(v)) return v.length ? v.join(", ") : "—";
  return v.trim() || "—";
}
function yesNo(v: boolean | undefined): string {
  return v ? "Yes" : "No";
}
function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return "TBD";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

// ─── design tokens (matching TRS reference PDF) ────────────────────────────────

const MARGIN = 48; // page left/right margin
const PAGE_W = 595; // A4 width in pts
const CONTENT_W = PAGE_W - MARGIN * 2;

// ─── styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#111111",
    paddingTop: 36,
    paddingBottom: 48,
    paddingHorizontal: MARGIN,
  },

  // ── version line (top right) ──
  versionLine: {
    position: "absolute",
    top: 20,
    right: MARGIN,
    fontSize: 8,
    color: "#999999",
    fontFamily: "Helvetica-Oblique",
  },

  // ── document header ──
  headerBlock: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#cccccc",
  },
  headerDate: {
    fontSize: 10,
    marginBottom: 16,
    color: "#333333",
  },
  headerEventTitle: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
    color: "#000000",
  },
  headerServiceLine: {
    fontSize: 10,
    color: "#444444",
    marginBottom: 20,
  },
  headerPartyBlock: {
    marginBottom: 10,
  },
  headerPartyLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: "#888888",
    marginBottom: 3,
  },
  headerPartyValue: {
    fontSize: 10,
    color: "#111111",
    lineHeight: 1.5,
  },
  headerPartyBold: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#111111",
  },
  headerRefRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eeeeee",
  },
  headerRefText: {
    fontSize: 8,
    color: "#999999",
  },

  // ── section heading ──
  sectionHeading: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#000000",
    marginTop: 18,
    marginBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 0.5,
    borderBottomColor: "#dddddd",
    paddingBottom: 4,
  },
  sectionBullet: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    marginRight: 5,
    color: "#000000",
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#000000",
  },

  // ── bullet rows ──
  bulletRow: {
    flexDirection: "row",
    marginBottom: 3,
    paddingLeft: 12,
  },
  bulletSymbol: {
    fontSize: 10,
    color: "#444444",
    marginRight: 6,
    width: 10,
  },
  bulletText: {
    fontSize: 10,
    color: "#333333",
    flex: 1,
    lineHeight: 1.4,
  },
  bulletTextBold: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#111111",
    flex: 1,
  },
  subBulletRow: {
    flexDirection: "row",
    marginBottom: 2,
    paddingLeft: 24,
  },
  subBulletSymbol: {
    fontSize: 9,
    color: "#666666",
    marginRight: 6,
    width: 10,
  },
  subBulletText: {
    fontSize: 9,
    color: "#444444",
    flex: 1,
    lineHeight: 1.4,
  },

  // ── client note box ──
  noteBox: {
    borderWidth: 1,
    borderColor: "#dddddd",
    backgroundColor: "#fafafa",
    padding: 10,
    marginBottom: 12,
    marginTop: 4,
  },
  noteTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
    color: "#333333",
  },
  noteText: {
    fontSize: 9,
    color: "#555555",
    lineHeight: 1.5,
  },

  // ── work plan ──
  workPlanRow: {
    flexDirection: "row",
    marginBottom: 4,
    paddingLeft: 12,
  },
  workPlanTime: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    width: 80,
    color: "#333333",
  },
  workPlanDesc: {
    fontSize: 9,
    color: "#444444",
    flex: 1,
    lineHeight: 1.4,
  },

  // ── financials table ──
  tableWrapper: {
    marginTop: 8,
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#111111",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableSectionRow: {
    flexDirection: "row",
    backgroundColor: "#eeeeee",
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginTop: 2,
  },
  tableSectionLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#555555",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableDataRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eeeeee",
  },
  tableDataRowAlt: {
    backgroundColor: "#f9f9f9",
  },
  colName: { width: "28%" },
  colDesc: { width: "36%" },
  colUnits: { width: "10%", textAlign: "right" },
  colPrice: { width: "13%", textAlign: "right" },
  colSubtotal: { width: "13%", textAlign: "right" },
  cellName: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#111111",
    lineHeight: 1.4,
  },
  cellDesc: {
    fontSize: 8,
    color: "#555555",
    lineHeight: 1.4,
  },
  cellNum: {
    fontSize: 9,
    color: "#333333",
  },
  cellNumBold: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#111111",
  },

  // ── total row ──
  totalRow: {
    flexDirection: "row",
    backgroundColor: "#111111",
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginTop: 2,
  },
  totalLabel: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    flex: 1,
  },
  totalAmount: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    textAlign: "right",
    width: "13%",
  },

  // ── terms ──
  termsTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginBottom: 12,
    color: "#000000",
  },
  termsSection: {
    marginBottom: 10,
  },
  termsSectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#111111",
    marginBottom: 3,
    textTransform: "uppercase",
  },
  termsText: {
    fontSize: 8.5,
    color: "#444444",
    lineHeight: 1.6,
  },

  // ── page footer ──
  pageFooter: {
    position: "absolute",
    bottom: 20,
    left: MARGIN,
    right: MARGIN,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 0.5,
    borderTopColor: "#dddddd",
    paddingTop: 6,
  },
  pageFooterText: {
    fontSize: 7.5,
    color: "#aaaaaa",
  },
});

// ─── sub-components ───────────────────────────────────────────────────────────

function BulletRow({ text, bold }: { text: string; bold?: boolean }) {
  return (
    <View style={s.bulletRow}>
      <Text style={s.bulletSymbol}>○</Text>
      <Text style={bold ? s.bulletTextBold : s.bulletText}>{text}</Text>
    </View>
  );
}

function SubBulletRow({ text }: { text: string }) {
  return (
    <View style={s.subBulletRow}>
      <Text style={s.subBulletSymbol}>■</Text>
      <Text style={s.subBulletText}>{text}</Text>
    </View>
  );
}

function SectionHeading({ title }: { title: string }) {
  return (
    <View style={s.sectionHeading}>
      <Text style={s.sectionBullet}>●</Text>
      <Text style={s.sectionTitle}>{title}</Text>
    </View>
  );
}

function PageFooter({ refNum, version }: { refNum: string; version: string }) {
  return (
    <View style={s.pageFooter} fixed>
      <Text style={s.pageFooterText}>{refNum}</Text>
      <Text style={s.pageFooterText}>{version}</Text>
    </View>
  );
}

// ─── main document ────────────────────────────────────────────────────────────

interface QuoteDocumentProps {
  data: QuoteFormData;
  items: LineItem[];
  subtotal: number;
}

export function QuoteDocument({ data, items, subtotal }: QuoteDocumentProps) {
  const now = new Date();
  const versionDate = now
    .toLocaleDateString("en-US", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\//g, ".");

  const fullDate = now.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Reference number: year.month.sequential (using timestamp as proxy)
  const refNum = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")}`;
  const versionLabel = `${versionDate} Version`;

  const eventName = data.eventName ?? "Untitled Event";
  const venueName = data.venueName ?? "TBD";
  const clientName = data.clientName ?? "TBD";
  const clientPhone = data.clientPhone ?? "";
  const org = data.organization ?? "";
  const eventDate =
    data.hasDate && data.eventDate ? formatDate(data.eventDate) : "TBD";
  const doorsTime = data.doorsTime ?? "TBD";
  const startTime = data.startTime ?? "TBD";
  const duration = data.hasDuration ? `${data.durationHours} hours` : "TBD";
  const setting = data.setting === "outdoor" ? "Outdoor" : "Indoor";

  // Build services summary for Technical Scope
  const hasStreaming = data.services.includes("streaming");
  const hasVideo = data.services.includes("video");
  const hasPA = data.audioServices.includes("pa");
  const activeVideoTypes = hasVideo ? (data.videoTypes ?? []) : [];

  // Build work plan entries
  const workPlan: [string, string][] = [];
  if (doorsTime !== "TBD") {
    workPlan.push([
      doorsTime,
      "Our staff arrives at the venue and begins their setup.",
    ]);
  }
  if (startTime !== "TBD") {
    workPlan.push([
      startTime,
      "AV elements are all set and checked. The room is audience-ready.",
    ]);
    workPlan.push([startTime, "The program begins."]);
  }
  // Pack-up is 30 min after last known time — approximate
  workPlan.push([
    "End + 30 min",
    "Our staff is packed up and leaves the venue.",
  ]);

  // Group line items by category for the financials table
  const laborItems = items.filter(
    (i) =>
      i.unit === "hrs" ||
      i.description.toLowerCase().includes("tech") ||
      i.name.toLowerCase().includes("tech") ||
      i.name.toLowerCase().includes("lead") ||
      i.name.toLowerCase().includes("operator"),
  );
  const equipItems = items.filter(
    (i) =>
      i.unit === "set" ||
      i.unit === "day" ||
      i.unit === "kit" ||
      i.unit === "pack" ||
      i.unit === "unit" ||
      i.unit === "service",
  );
  const postItems = items.filter(
    (i) =>
      i.unit === "edit" ||
      i.unit === "talk" ||
      i.unit === "short" ||
      i.unit === "slot" ||
      i.description.toLowerCase().includes("edit"),
  );
  const otherItems = items.filter(
    (i) =>
      !laborItems.includes(i) &&
      !equipItems.includes(i) &&
      !postItems.includes(i),
  );

  return (
    <Document
      title={`Production Estimate — ${eventName}`}
      author="The Recording Service LLC"
    >
      {/* ══════════════════════════════════════════════════════════════════
          PAGE 1 — COVER / HEADER
      ══════════════════════════════════════════════════════════════════ */}
      <Page size="A4" style={s.page}>
        <Text style={s.versionLine}>{versionLabel}</Text>

        {/* Header block */}
        <View style={s.headerBlock}>
          <Text style={s.headerDate}>{fullDate}</Text>
          <Text style={s.headerEventTitle}>{eventName}</Text>
          <Text style={s.headerServiceLine}>
            {[
              hasStreaming ? "Live Streaming" : null,
              hasVideo ? "Video Production" : null,
              hasPA ? "Audio / PA" : null,
            ]
              .filter(Boolean)
              .join(" + ") || "Production Estimate"}
          </Text>

          {/* For / At / Produced By columns */}
          <View style={{ flexDirection: "row", gap: 0 }}>
            <View style={{ flex: 1 }}>
              <Text style={s.headerPartyLabel}>For</Text>
              {!data.isSpecQuote ? (
                <>
                  <Text style={s.headerPartyBold}>{clientName}</Text>
                  {clientPhone ? (
                    <Text style={s.headerPartyValue}>{clientPhone}</Text>
                  ) : null}
                  {data.deliveryEmail ? (
                    <Text style={s.headerPartyValue}>{data.deliveryEmail}</Text>
                  ) : null}
                  {org ? <Text style={s.headerPartyValue}>{org}</Text> : null}
                </>
              ) : (
                <Text style={s.headerPartyValue}>(Spec Quote)</Text>
              )}
            </View>

            <View style={{ flex: 1 }}>
              <Text style={s.headerPartyLabel}>At</Text>
              <Text style={s.headerPartyBold}>{venueName}</Text>
              {data.setting ? (
                <Text style={s.headerPartyValue}>{setting}</Text>
              ) : null}
            </View>

            <View style={{ flex: 1 }}>
              <Text style={s.headerPartyLabel}>To Be Produced By</Text>
              <Text style={s.headerPartyBold}>The Recording Service LLC</Text>
              <Text style={s.headerPartyValue}>
                harry@therecordingservice.com
              </Text>
              <Text style={s.headerPartyValue}>770-696-3139</Text>
            </View>
          </View>

          <View style={s.headerRefRow}>
            <Text style={s.headerRefText}>Event Date: {eventDate}</Text>
            <Text style={s.headerRefText}>
              Doors: {doorsTime} | Show: {startTime} | Duration: {duration}
            </Text>
            <Text style={s.headerRefText}>{refNum}</Text>
          </View>
        </View>

        {/* Client Will Provide */}
        <View style={s.noteBox}>
          <Text style={s.noteTitle}>
            *** Client Will Provide The Following ***
          </Text>
          <Text style={s.noteText}>
            1. Please provide three (3) days before the production
          </Text>
          <Text style={[s.noteText, { paddingLeft: 16 }]}>
            a. Run of Show document detailing the program
          </Text>
          {data.builtInAV && data.builtInAV.length > 0 && (
            <Text style={[s.noteText, { paddingLeft: 16 }]}>
              b. Access to venue's built-in AV: {data.builtInAV.join(", ")}
            </Text>
          )}
          {hasStreaming && (
            <Text style={[s.noteText, { paddingLeft: 16 }]}>
              {`c. Internet upload speed of at least 15 mb/s per streaming platform`}
            </Text>
          )}
        </View>

        {/* Technical Scope */}
        {hasStreaming && (
          <>
            <SectionHeading title="Live Streaming" />
            <BulletRow
              text={`STREAM KIT: Encoder, switcher, and stream control system`}
              bold
            />
            {!data.isZoomOnly && (
              <>
                <BulletRow
                  text={`CAMERA SETUP: ${data.cameraCount ?? "1"} camera(s) — ${data.cameraSource === "built-in" ? "using venue built-in cameras" : "camcorder kit(s)"}`}
                />
                {data.streamGraphics && (
                  <BulletRow text="STREAM GRAPHICS: On-screen overlays and branding prepared" />
                )}
                {!data.diyStream && (
                  <BulletRow text="STREAM LINK SETUP: Destination platform configured by our tech" />
                )}
              </>
            )}
            {data.isZoomOnly && (
              <BulletRow text="Using all venue built-in AV to stream to Zoom only" />
            )}
          </>
        )}

        {hasVideo && (
          <>
            <SectionHeading title="Video Production" />
            {activeVideoTypes.includes("podcast") && (
              <>
                <BulletRow text="VIDEO PODCAST" bold />
                <SubBulletRow text="2x Mirrorless camera kit + Studio lighting kit" />
                <SubBulletRow text="Production Lead + Lighting Technician" />
                <SubBulletRow
                  text={`${data.podcastEpisodes ?? 1} episode(s) — ${data.podcastDuration ?? 1} hr recording session each`}
                />
                <SubBulletRow text="Guests should arrive at least 15 minutes before filming to be mic'd up" />
              </>
            )}
            {activeVideoTypes.includes("web-video") && (
              <>
                <BulletRow text="WEB VIDEO" bold />
                <SubBulletRow text="Mirrorless camera kit + Studio lighting kit" />
                <SubBulletRow
                  text={`${data.webVideoPeople ?? 1} person(s) filmed — ${data.webVideoCount ?? 1} video(s) produced — up to ${data.webVideoDuration ?? 3} min each`}
                />
                <SubBulletRow text="Guests should arrive at least 15 minutes before filming to be mic'd up" />
              </>
            )}
            {activeVideoTypes.includes("highlight") && (
              <>
                <BulletRow text="EVENT HIGHLIGHT" bold />
                <SubBulletRow text="Mirrorless camera kit — in 30 min, out 30 min" />
                <SubBulletRow
                  text={`Recording duration: ${data.highlightDurationHours ?? 4} hr(s) — ${(data.highlightDurationHours ?? 4) < 4 ? "Half Day Rate" : "Full Day Rate"}`}
                />
                <SubBulletRow text="Delivered as a creative highlight reel" />
              </>
            )}
            {activeVideoTypes.includes("lecture") && (
              <>
                <BulletRow text="LECTURE OR PANEL DISCUSSION" bold />
                <SubBulletRow text="Camcorder kit + AV essential kit" />
                <SubBulletRow
                  text={`${data.lectureTalksCount ?? 1} talk(s) — ${data.lectureTalkDuration ?? "up to 1hr"} each`}
                />
                {data.lecturePPT && (
                  <SubBulletRow text="Includes PowerPoint slide recording and integration" />
                )}
                {data.additionalAngles && (data.angleCount ?? 0) > 0 && (
                  <SubBulletRow
                    text={`${data.angleCount} additional camera angle(s)`}
                  />
                )}
                <SubBulletRow text="STANDARD VIDEO EDIT: Audio touch-ups, subtitles (.srt), lower thirds, intro/outro screens" />
              </>
            )}
          </>
        )}

        {hasPA && (
          <>
            <SectionHeading title="Audio / Public Address" />
            <BulletRow
              text={`${data.setting === "outdoor" ? "OUTDOOR" : "INDOOR"} AUDIO KIT: Full PA system`}
              bold
            />
            {!data.builtInAV?.includes("audio") && (
              <>
                {(data.micWirelessHandheld ?? 0) > 0 && (
                  <SubBulletRow
                    text={`Wireless Handheld Mic x${data.micWirelessHandheld}`}
                  />
                )}
                {(data.micWirelessLav ?? 0) > 0 && (
                  <SubBulletRow
                    text={`Wireless Lav Mic x${data.micWirelessLav}`}
                  />
                )}
                {(data.micWiredSM58 ?? 0) > 0 && (
                  <SubBulletRow text={`Wired SM58 x${data.micWiredSM58}`} />
                )}
                {(data.micWiredGooseneck ?? 0) > 0 && (
                  <SubBulletRow
                    text={`Wired Gooseneck x${data.micWiredGooseneck}`}
                  />
                )}
                {data.micNotSure && (
                  <SubBulletRow text="Mic quantity TBD — Producer will follow up" />
                )}
              </>
            )}
            {data.builtInAV?.includes("audio") && (
              <SubBulletRow text="Using venue built-in sound system" />
            )}
            {data.vogEnabled && (
              <SubBulletRow
                text={`Voice of God mic — ${data.vogAnnouncer === "tech" ? "announced by our audio tech" : "announced by client team"}`}
              />
            )}
            {data.monitorsEnabled && (data.monitors ?? 0) > 0 && (
              <SubBulletRow text={`Stage monitor wedges x${data.monitors}`} />
            )}
            {(data.attendance ?? 0) > 0 && (
              <SubBulletRow
                text={`Expected attendance: ${data.attendance} — speaker count calculated accordingly`}
              />
            )}
          </>
        )}

        {/* Work Plan */}
        {workPlan.length > 0 && (
          <>
            <SectionHeading title="Work Plan" />
            {workPlan.map(([time, desc], i) => (
              <View key={i} style={s.workPlanRow}>
                <Text style={s.workPlanTime}>{time}</Text>
                <Text style={s.workPlanDesc}>{desc}</Text>
              </View>
            ))}
          </>
        )}

        <PageFooter refNum={refNum} version={versionLabel} />
      </Page>

      {/* ══════════════════════════════════════════════════════════════════
          PAGE 2 — DETAILED FINANCIALS
      ══════════════════════════════════════════════════════════════════ */}
      <Page size="A4" style={s.page}>
        <Text style={s.versionLine}>{versionLabel}</Text>

        <Text style={[s.termsTitle, { marginBottom: 16 }]}>
          Detailed Financials
        </Text>

        <View style={s.tableWrapper}>
          {/* Table header */}
          <View style={s.tableHeaderRow}>
            <Text style={[s.tableHeaderCell, s.colName]}>Item Name</Text>
            <Text style={[s.tableHeaderCell, s.colDesc]}>Item Description</Text>
            <Text style={[s.tableHeaderCell, s.colUnits]}>Units</Text>
            <Text style={[s.tableHeaderCell, s.colPrice]}>Price / Unit</Text>
            <Text style={[s.tableHeaderCell, s.colSubtotal]}>Subtotal</Text>
          </View>

          {/* Labor section */}
          {laborItems.length > 0 && (
            <>
              <View style={s.tableSectionRow}>
                <Text style={s.tableSectionLabel}>Labor</Text>
              </View>
              {laborItems.map((item, idx) => (
                <View
                  key={idx}
                  style={[
                    s.tableDataRow,
                    idx % 2 !== 0 ? s.tableDataRowAlt : {},
                  ]}
                  wrap={false}
                >
                  <View style={s.colName}>
                    <Text style={s.cellName}>{item.name}</Text>
                  </View>
                  <View style={s.colDesc}>
                    <Text style={s.cellDesc}>{item.description}</Text>
                  </View>
                  <Text style={[s.cellNum, s.colUnits]}>
                    {item.quantity} {item.unit}
                  </Text>
                  <Text style={[s.cellNum, s.colPrice]}>{fmt(item.rate)}</Text>
                  <Text style={[s.cellNumBold, s.colSubtotal]}>
                    {fmt(item.total)}
                  </Text>
                </View>
              ))}
            </>
          )}

          {/* Equipment section */}
          {equipItems.length > 0 && (
            <>
              <View style={s.tableSectionRow}>
                <Text style={s.tableSectionLabel}>Equipment</Text>
              </View>
              {equipItems.map((item, idx) => (
                <View
                  key={idx}
                  style={[
                    s.tableDataRow,
                    idx % 2 !== 0 ? s.tableDataRowAlt : {},
                  ]}
                  wrap={false}
                >
                  <View style={s.colName}>
                    <Text style={s.cellName}>{item.name}</Text>
                  </View>
                  <View style={s.colDesc}>
                    <Text style={s.cellDesc}>{item.description}</Text>
                  </View>
                  <Text style={[s.cellNum, s.colUnits]}>
                    {item.quantity} {item.unit}
                  </Text>
                  <Text style={[s.cellNum, s.colPrice]}>{fmt(item.rate)}</Text>
                  <Text style={[s.cellNumBold, s.colSubtotal]}>
                    {fmt(item.total)}
                  </Text>
                </View>
              ))}
            </>
          )}

          {/* Post-Production section */}
          {postItems.length > 0 && (
            <>
              <View style={s.tableSectionRow}>
                <Text style={s.tableSectionLabel}>Post-Production</Text>
              </View>
              {postItems.map((item, idx) => (
                <View
                  key={idx}
                  style={[
                    s.tableDataRow,
                    idx % 2 !== 0 ? s.tableDataRowAlt : {},
                  ]}
                  wrap={false}
                >
                  <View style={s.colName}>
                    <Text style={s.cellName}>{item.name}</Text>
                  </View>
                  <View style={s.colDesc}>
                    <Text style={s.cellDesc}>{item.description}</Text>
                  </View>
                  <Text style={[s.cellNum, s.colUnits]}>
                    {item.quantity} {item.unit}
                  </Text>
                  <Text style={[s.cellNum, s.colPrice]}>{fmt(item.rate)}</Text>
                  <Text style={[s.cellNumBold, s.colSubtotal]}>
                    {fmt(item.total)}
                  </Text>
                </View>
              ))}
            </>
          )}

          {/* Other items */}
          {otherItems.length > 0 && (
            <>
              <View style={s.tableSectionRow}>
                <Text style={s.tableSectionLabel}>Other</Text>
              </View>
              {otherItems.map((item, idx) => (
                <View
                  key={idx}
                  style={[
                    s.tableDataRow,
                    idx % 2 !== 0 ? s.tableDataRowAlt : {},
                  ]}
                  wrap={false}
                >
                  <View style={s.colName}>
                    <Text style={s.cellName}>{item.name}</Text>
                  </View>
                  <View style={s.colDesc}>
                    <Text style={s.cellDesc}>{item.description}</Text>
                  </View>
                  <Text style={[s.cellNum, s.colUnits]}>
                    {item.quantity} {item.unit}
                  </Text>
                  <Text style={[s.cellNum, s.colPrice]}>{fmt(item.rate)}</Text>
                  <Text style={[s.cellNumBold, s.colSubtotal]}>
                    {fmt(item.total)}
                  </Text>
                </View>
              ))}
            </>
          )}

          {/* Total */}
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Total</Text>
            <Text style={s.totalAmount}>{fmt(subtotal)}</Text>
          </View>
        </View>

        {/* This is an Estimate note */}
        <View style={[s.noteBox, { marginTop: 16 }]}>
          <Text style={s.noteTitle}>This is an Estimate</Text>
          <Text style={s.noteText}>
            This is the price of the tech scope we have discussed so far. If the
            scope or deliverables change, the final price will be different.
            Your Production Lead will discuss with you about anything that would
            affect the final price (e.g., extra microphones, the show running
            late, etc).
          </Text>
        </View>

        <PageFooter refNum={refNum} version={versionLabel} />
      </Page>

      {/* ══════════════════════════════════════════════════════════════════
          PAGE 3 — TERMS & CONDITIONS
      ══════════════════════════════════════════════════════════════════ */}
      <Page size="A4" style={s.page}>
        <Text style={s.versionLine}>{versionLabel}</Text>

        <Text style={s.termsTitle}>Terms and Conditions</Text>
        <Text style={[s.termsText, { marginBottom: 12, color: "#888888" }]}>
          Last updated: April 1, 2024
        </Text>

        {[
          {
            title: "I. Rush Fee",
            body: "A rush fee not to exceed 20% of the quote shall apply to any events requested with less than two (2) full business days' notice (16 business hours).",
          },
          {
            title: "II. Cancellation Fee",
            body: "30–6 Days Before: Pre-Production fully billed for completed work; Production Labor 50% charge; Equipment 25% of quoted cost; Post-Production no charge.\n\n5–1 Day Before: Production Labor 50% charge for all labor; Equipment 50% of quoted cost.\n\nLess than 24 Hours: Production Labor & Equipment fully billed; Post-Production no charge.",
          },
          {
            title: "III. Edited Video Reviews and Revisions",
            body: "Clients have 60 days to review delivered videos. Once feedback is received, a revised version will be completed and delivered within 2 business days.",
          },
          {
            title: "IV. PowerPoint Presentation",
            body: "PPTs must be submitted at least 3 days prior to the event. Discounts or refunds will not be issued for issues related to PPTs not delivered within this timeframe.",
          },
          {
            title: "V. This is an Estimate",
            body: "This is the price of the tech scope discussed so far. If the scope or deliverables change, the final price will differ. Your Production Lead will discuss anything that would affect the final price.",
          },
          {
            title:
              "VI. Deposit Requirement for Projects Exceeding ${CURRENCY.symbol}10,000",
            body: "For projects valued over ${CURRENCY.symbol}10,000, we require a 50% deposit paid 14 days before the first day of your show.",
          },
          {
            title: "VII. Video Editing Billing",
            body: "For projects with video editing, we split the bill into 'Production Day' and 'Video Editing' expenses. Filming production costs are included in the second invoice, except if TRS Tech delivers raw footage immediately after filming.",
          },
          {
            title: "VIII. Holidays",
            body: "Billed at 1.5× rate for labor: New Year's Day, Memorial Day, July 4th, Labor Day, Black Friday, New Year's Eve after 12pm.\n\nBilled at 2× rate for labor: Thanksgiving, Christmas Day, Christmas Eve.",
          },
        ].map(({ title, body }) => (
          <View key={title} style={s.termsSection} wrap={false}>
            <Text style={s.termsSectionTitle}>{title}</Text>
            <Text style={s.termsText}>{body}</Text>
          </View>
        ))}

        <PageFooter refNum={refNum} version={versionLabel} />
      </Page>
    </Document>
  );
}
