import { z } from "zod";

export const LeadCaptureSchema = z.object({
  firstName: z.string().trim().min(2, "First name is required"),
  lastName: z.string().trim().min(2, "Last name is required"),
  email: z.string().email("Invalid email address").toLowerCase(),
  subject: z.string().trim().min(5, "Subject is too short"),
  message: z.string().trim().min(10, "Please provide more detail"),
  privacyPolicy: z.literal(true, { message: "Acceptance is required" }),
  website_url: z.string().max(0).optional(),
});

export const QuoteFormSchema = z.object({
  // ── Step 2: Time & Place ─────────────────────────────────────────────────

  eventType: z.enum(["live", "studio", "other"]).default("live"),

  // Live event
  hasDate: z.boolean().default(false),
  eventDate: z.string().optional(),
  isMultiDay: z.boolean().default(false),
  venueType: z.enum(["single", "multiple", "tbd"]).default("single"),
  setting: z.enum(["indoor", "outdoor"]).default("indoor"),
  startTime: z.string().default("09:00"),
  doorsTime: z.string().default("08:30"), // 30 min before show time
  hasDuration: z.boolean().default(false),
  durationHours: z.coerce.number().min(1).default(4),

  // Studio recording — new fields
  studioHasDuration: z.boolean().default(false),
  studioDurationHours: z.coerce.number().min(0.5).default(4),
  studioLocationType: z.enum(["office", "studio-rental"]).default("office"),

  // Shared
  locationType: z.enum(["office", "rented"]).default("office"),
  builtInAV: z.array(z.string()).default([]),

  // ── Step 3: Services — Streaming ─────────────────────────────────────────

  services: z.array(z.string()).default([]),
  isZoomOnly: z.boolean().default(false),
  cameraSource: z.enum(["built-in", "bring"]).default("bring"),
  cameraCount: z.string().default("1"),
  streamGraphics: z.boolean().default(false),
  diyStream: z.boolean().default(false),

  // ── Step 3: Services — Video ─────────────────────────────────────────────

  videoTypes: z.array(z.string()).default([]),

  // Web Video
  webVideoPeople: z.coerce.number().min(1).default(1),
  webVideoCount: z.coerce.number().min(1).max(12).default(1),
  webVideoDuration: z.coerce.number().min(1).default(3),

  // Podcast
  podcastEpisodes: z.coerce.number().min(1).default(1),
  podcastDuration: z.coerce.number().min(1).default(1),

  // Event Highlight
  highlightSessions: z.coerce.number().min(1).max(3).default(1),
  highlightDurationHours: z.coerce.number().min(1).default(4),

  // Lecture / Panel Discussion
  lectureTalksCount: z.coerce.number().min(1).default(1),
  lectureTalkDuration: z
    .enum(["up to 1hr", "up to 2hr", "up to 3hr", "longer (call sales)"])
    .default("up to 1hr"),
  lecturePPT: z.boolean().default(false),
  lectureFromStream: z.boolean().default(false), // cuts from stream material?
  additionalAngles: z.boolean().default(false),
  angleCount: z.coerce.number().min(0).default(0),

  // Social Shorts
  wantsSocialShorts: z.boolean().default(false),
  socialShortsCount: z.coerce.number().min(0).default(0),
  shortsSource: z.enum(["filming", "recut"]).default("recut"),

  // ── Step 4: Audio Services ────────────────────────────────────────────────

  // Which audio services (Public Address, Band, Recording)
  audioServices: z.array(z.string()).default([]),

  // Mic counts by type
  micWirelessHandheld: z.coerce.number().min(0).default(0),
  micWirelessLav: z.coerce.number().min(0).default(0),
  micWiredSM58: z.coerce.number().min(0).default(0),
  micWiredGooseneck: z.coerce.number().min(0).default(0),
  micRockBand: z.boolean().default(false),
  micNotSure: z.boolean().default(false),

  // Playback
  playbackEnabled: z.boolean().default(false),
  playbackSource: z.enum(["client", "spotify"]).optional(),

  // Voice of God
  vogEnabled: z.boolean().default(false),
  vogAlreadyCounted: z.boolean().default(false),
  vogMicType: z.enum(["handheld", "wired"]).optional(),
  vogAnnouncer: z.enum(["team", "tech"]).optional(),

  // Monitors
  monitorsEnabled: z.boolean().default(false),
  monitors: z.coerce.number().min(0).default(0),

  // Attendance (speaker algorithm)
  attendance: z.coerce.number().min(0).default(0),

  // ── Step 4: More Event AV ─────────────────────────────────────────────────

  // Projectors & Screens
  wantsProjector: z.boolean().default(false),
  projectorScreenSize: z.enum(["12ft", "16ft", "not-sure"]).optional(),
  projectorScreenCount: z.coerce.number().min(0).default(1),

  // TVs
  wantsTVs: z.boolean().default(false),
  tvSize: z.enum(["85", "75", "other"]).optional(),
  tvCount: z.coerce.number().min(0).default(1),
  tvStand: z.enum(["truss", "cart", "floor", "other"]).optional(),

  // Confidence monitors
  wantsConfidenceMonitors: z.boolean().default(false),
  confidenceMonitorCount: z.coerce.number().min(0).default(1),

  // Lighting
  lightingServices: z.array(z.string()).default([]),
  stageWashWidth: z.coerce.number().min(0).default(10), // feet
  wirelessUplightCount: z.coerce.number().min(6).default(6),

  // Photography
  photographyServices: z.array(z.string()).default([]),

  // ── Step 5: It's All About You ────────────────────────────────────────────

  eventName: z
    .string()
    .min(1, "Event name is required")
    .default("Untitled Event"),
  isSpecQuote: z.boolean().default(false),
  clientName: z.string().optional(),
  clientPhone: z.string().optional(),
  organization: z.string().optional(),
  venueName: z.string().optional(),
  hasAdditionalPOC: z.boolean().default(false),
  additionalPOC: z.string().optional(),

  // ── Step 6: Send ─────────────────────────────────────────────────────────

  deliveryEmail: z
    .string()
    .email("Please provide a valid email to receive your quote")
    .toLowerCase()
    .default(""),
  newsletterConsent: z.boolean().default(false),
  feedback: z.string().optional(),
});

export type LeadCaptureData = z.infer<typeof LeadCaptureSchema>;
export type QuoteFormData = z.infer<typeof QuoteFormSchema>;
