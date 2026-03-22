import { QuoteFormData } from "@/schema/quote";
import { RATES } from "@/lib/pricing";

export interface LineItem {
  name: string;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  total: number;
}

export const calculateSOW = (data: QuoteFormData) => {
  const items: LineItem[] = [];
  let needsTrucking = false;

  // ── Sanitize: derive active values from parent toggles ───────────────────
  //
  // Form state preserves sub-question answers even when a parent service is
  // deselected (so re-selecting it restores the answers). calculateSOW must
  // only act on data whose parent is currently active.

  const activeVideoTypes = data.services.includes("video")
    ? (data.videoTypes ?? [])
    : [];

  const activeShortsCount = data.wantsSocialShorts
    ? (data.socialShortsCount ?? 0)
    : 0;

  const isStreamingActive = data.services.includes("streaming");
  const isPAActive = data.audioServices.includes("pa");

  // ── Redirect guards ──────────────────────────────────────────────────────

  const logisticsRedirects =
    data.eventType === "other" ||
    data.isMultiDay ||
    data.venueType === "multiple" ||
    data.locationType === "rented" ||
    data.studioLocationType === "studio-rental";

  const videoRedirects = activeVideoTypes.some((v) =>
    ["concert", "other"].includes(v),
  );

  const streamingRedirects =
    isStreamingActive &&
    (data.cameraCount === "2+ (call sales)" ||
      data.cameraCount === "not sure (call sales)");

  const webVideoTooMuch =
    activeVideoTypes.includes("web-video") &&
    (data.webVideoCount > 12 || data.webVideoDuration > 3);

  const lectureTooLong =
    activeVideoTypes.includes("lecture") &&
    data.lectureTalkDuration === "longer (call sales)";

  const audioRedirects =
    data.audioServices.includes("band") ||
    data.audioServices.includes("recording");

  if (
    logisticsRedirects ||
    videoRedirects ||
    streamingRedirects ||
    webVideoTooMuch ||
    lectureTooLong ||
    audioRedirects
  ) {
    return { items: [], shouldRedirect: true };
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  const R = RATES; // shorthand

  const addItem = (
    name: string,
    desc: string,
    qty: number,
    unit: string,
    rate: number,
  ) => {
    items.push({
      name,
      description: desc,
      quantity: qty,
      unit,
      rate,
      total: Math.round(qty * rate * 100) / 100, // round to cents
    });
  };

  const eventDuration = data.hasDuration ? (data.durationHours ?? 4) : 4;
  const hasBuiltInCameras = data.builtInAV?.includes("cameras");
  const hasBuiltInAudio = data.builtInAV?.includes("audio");
  const hasBuiltInPJ = data.builtInAV?.includes("projector");
  const hasBuiltInTVs = data.builtInAV?.includes("tvs");

  // ── 1. VIDEO PRODUCTION ──────────────────────────────────────────────────

  if (data.eventType === "studio") {
    const studioDuration = data.studioHasDuration
      ? (data.studioDurationHours ?? 4)
      : 4;

    const isStudioProduction = activeVideoTypes.some((v) =>
      ["podcast", "web-video"].includes(v),
    );

    if (isStudioProduction) {
      // 2.5h setup + 1.5h packup = 4h overhead, plus recording time
      const studioHrs = 4 + studioDuration;
      addItem(
        "Production Lead (Studio)",
        "Setup (2.5h) & Packup (1.5h)",
        studioHrs,
        "hrs",
        R.labor.productionLead,
      );
      addItem(
        "Lighting Technician",
        "Studio Lighting Kit Support",
        studioHrs,
        "hrs",
        R.labor.lightingTech,
      );
      addItem(
        "Studio Camera Kit",
        "2x Mirrorless Kit + Studio Lighting",
        1,
        "set",
        R.equipment.studioCameraKit,
      );
    }

    if (activeVideoTypes.includes("podcast")) {
      const episodes = data.podcastEpisodes ?? 1;
      addItem(
        "Podcast Editing",
        `Edit for ${episodes} episode(s)`,
        episodes,
        "unit",
        R.postProduction.podcastEdit,
      );
    }

    if (activeVideoTypes.includes("web-video")) {
      const videoQty = data.webVideoCount ?? 1;
      // 30 min per person OR per video, whichever is higher
      const filmingUnits = Math.max(data.webVideoPeople ?? 1, videoQty);
      addItem(
        "Web Video Filming Time",
        `${filmingUnits} × 30min slot(s)`,
        filmingUnits,
        "slot",
        R.postProduction.webVideoFilming,
      );
      addItem(
        "Web Video Editing",
        `Edit for ${videoQty} video(s)`,
        videoQty,
        "unit",
        R.postProduction.webVideoEdit,
      );
    }
  }

  if (data.eventType === "live") {
    if (activeVideoTypes.includes("highlight")) {
      const isHalfDay = (data.highlightDurationHours ?? 0) < 4;
      addItem(
        "Mirrorless Kit (Highlight)",
        isHalfDay ? "Half Day Rate" : "Full Day Rate",
        1,
        "day",
        isHalfDay
          ? R.equipment.mirrorlessHalfDay
          : R.equipment.mirrorlessFullDay,
      );
      addItem(
        "Highlight Tech",
        "30m Setup / 30m Packup",
        1,
        "flat",
        R.labor.videoTech * 1,
      );
      addItem(
        "Event Highlight Edit",
        "Creative highlight reel",
        1,
        "edit",
        R.postProduction.highlightEdit,
      );
    }

    if (activeVideoTypes.includes("lecture")) {
      const talkCount = data.lectureTalksCount ?? 1;
      const editRate = data.lecturePPT
        ? R.postProduction.lectureEditWithPPT
        : R.postProduction.lectureEditNoPPT;

      // 1.5h setup + 0.75h packup = 2.25h overhead
      const lectureHrs = 2.25 + eventDuration;
      addItem(
        "Camcorder & AV Kit",
        "Lecture/Panel Essential Kit",
        1,
        "set",
        R.equipment.camcorderKit,
      );
      addItem(
        "Video Tech (Lecture)",
        "1.5h Setup / 45m Packup",
        lectureHrs,
        "hrs",
        R.labor.videoTech,
      );
      addItem(
        "Lecture Editing",
        `${talkCount} talk(s)`,
        talkCount,
        "talk",
        editRate,
      );

      // Additional camera angles
      if (data.additionalAngles && (data.angleCount ?? 0) > 0) {
        const angles = data.angleCount ?? 1;
        addItem(
          "Additional Camera Kit",
          `${angles} extra angle(s)`,
          angles,
          "set",
          R.equipment.additionalCamKit,
        );
        addItem(
          "Additional Cam Operator",
          `${angles} op(s)`,
          angles,
          "person",
          R.labor.cameraOperator * lectureHrs,
        );
      }
    }
  }

  // ── 2. LIVE STREAMING ────────────────────────────────────────────────────

  if (isStreamingActive) {
    const isBuiltIn = data.cameraSource === "built-in";
    const camCount = parseInt(data.cameraCount || "1") || 1;

    // 3h setup + 1.5h strike = 4.5h overhead
    const streamHrs = 4.5 + eventDuration;
    addItem(
      "Streaming Tech",
      "3h Setup / 1.5h Strike",
      streamHrs,
      "hrs",
      R.labor.streamingTech,
    );
    addItem(
      "Stream Control Kit",
      "Encoder & Switcher System",
      1,
      "set",
      R.equipment.streamControlKit,
    );

    if (!isBuiltIn) {
      addItem(
        "Camera Kit (Stream)",
        `Camcorder ×${camCount}`,
        camCount,
        "set",
        R.equipment.camcorderKit,
      );
    }

    // Camera operator: 2.25h setup/strike per camera
    const camOpHrs = 2.25 + eventDuration;
    addItem(
      "Camera Operator",
      `${camCount} op(s) @ 2.25h setup/strike`,
      camCount,
      "person",
      R.labor.cameraOperator * camOpHrs,
    );

    if (data.streamGraphics)
      addItem(
        "Stream Graphics Prep",
        "Overlays & Branding",
        1,
        "flat",
        R.streaming.streamGraphicsPrep,
      );
    if (!data.diyStream)
      addItem(
        "Stream Link Setup",
        "Destination Config",
        1,
        "flat",
        R.streaming.streamLinkSetup,
      );
  }

  // ── 3. SOCIAL SHORTS ─────────────────────────────────────────────────────

  if (activeShortsCount > 0) {
    addItem(
      "Social Shorts Editing",
      `Vertical cutdowns ×${activeShortsCount}`,
      activeShortsCount,
      "short",
      R.postProduction.socialShortEdit,
    );

    // Only add a mirrorless kit if filming new material and nothing else is already filming
    const alreadyFilming = activeVideoTypes.length > 0 || isStreamingActive;
    if (data.shortsSource === "filming" && !alreadyFilming) {
      addItem(
        "Mirrorless Kit (Shorts Add-on)",
        "Social filming camera kit",
        1,
        "day",
        R.equipment.mirrorlessAddOn,
      );
    }
  }

  // ── 4. AUDIO SERVICES ────────────────────────────────────────────────────

  if (isPAActive) {
    const isOutdoor = data.setting === "outdoor";

    // Audio kit — skipped if venue has built-in sound system
    if (!hasBuiltInAudio) {
      addItem(
        isOutdoor ? "Outdoor Audio Kit" : "Indoor Audio Kit",
        isOutdoor ? "Full outdoor PA system" : "Full indoor PA system",
        1,
        "set",
        isOutdoor ? R.equipment.outdoorAudioKit : R.equipment.indoorAudioKit,
      );
      if (isOutdoor) needsTrucking = true;
    }

    // Speaker algorithm: base kit covers first 100 people, +1 speaker per 100 after
    const extraSpeakers = Math.max(
      0,
      Math.floor((data.attendance ?? 0) / 100) - 1,
    );
    if (extraSpeakers > 0) {
      addItem(
        "Additional Speakers",
        `${extraSpeakers} extra speaker(s) for ${data.attendance} attendees`,
        extraSpeakers,
        "unit",
        R.equipment.extraSpeaker,
      );
      if (extraSpeakers > 1) needsTrucking = true;
    }

    // Mics — skipped if venue has built-in sound system
    if (!hasBuiltInAudio) {
      const micItems: {
        count: number | undefined;
        name: string;
        rate: number;
      }[] = [
        {
          count: data.micWirelessHandheld,
          name: "Wireless Handheld Mic",
          rate: R.mics.wirelessHandheld,
        },
        {
          count: data.micWirelessLav,
          name: "Wireless Lav Mic",
          rate: R.mics.wirelessLav,
        },
        {
          count: data.micWiredSM58,
          name: "Wired SM58 Mic",
          rate: R.mics.wiredSM58,
        },
        {
          count: data.micWiredGooseneck,
          name: "Wired Gooseneck Mic",
          rate: R.mics.wiredGooseneck,
        },
      ];
      for (const { count, name, rate } of micItems) {
        if ((count ?? 0) > 0) {
          addItem(name, `${count} unit(s)`, count ?? 1, "unit", rate);
        }
      }
      if (data.micRockBand) {
        addItem(
          "Rock Band Mic Locker",
          "Full band mic kit — PL to discuss specifics",
          1,
          "set",
          R.mics.rockBandLocker,
        );
      }
    }

    // VOG mic — only add if not already counted in mic section above
    if (data.vogEnabled && !data.vogAlreadyCounted) {
      const vogRate =
        data.vogMicType === "wired" ? R.mics.vogWired : R.mics.vogWireless;
      addItem(
        "VOG Announcement Mic",
        data.vogMicType === "wired" ? "Wired" : "Wireless Handheld",
        1,
        "unit",
        vogRate,
      );
    }

    // Stage monitors
    if (data.monitorsEnabled && (data.monitors ?? 0) > 0) {
      addItem(
        "Stage Monitor (Wedge)",
        `${data.monitors} unit(s)`,
        data.monitors ?? 1,
        "unit",
        R.equipment.stageMonitor,
      );
    }
  }

  // ── 5. MORE EVENT AV ─────────────────────────────────────────────────────

  // Projector & Screen — skipped if venue has built-in projector
  if (data.wantsProjector && !hasBuiltInPJ) {
    const screenCount = data.projectorScreenCount ?? 1;
    const screenRate =
      data.projectorScreenSize === "16ft"
        ? R.equipment.projectorScreen16ft
        : R.equipment.projectorScreen12ft;

    addItem(
      "Projector",
      "Ultra short-throw, 8k brightness",
      1,
      "unit",
      R.equipment.projector,
    );
    addItem(
      "Projection Screen",
      `${data.projectorScreenSize ?? "12ft"}`,
      screenCount,
      "unit",
      screenRate,
    );
    addItem(
      "Projector Tech",
      "1hr setup after screen, 30min strike",
      1,
      "flat",
      R.labor.productionLead * 1.5,
    );
    addItem(
      "Projector Accessory Kit",
      "Cables, mounts, accessories",
      1,
      "set",
      R.equipment.projectorAccessories,
    );

    if (screenCount > 1) {
      addItem(
        "SDI Kit (Extra Screens)",
        `${screenCount - 1} extra screen(s)`,
        screenCount - 1,
        "set",
        R.equipment.sdiKit,
      );
    }
    needsTrucking = true;
  }

  // Big Screen TVs — skipped if venue has built-in TVs
  if (data.wantsTVs && !hasBuiltInTVs) {
    const tvCount = data.tvCount ?? 1;
    const tvRate =
      data.tvSize === "85" ? R.equipment.tv85inch : R.equipment.tv75inch;

    addItem(
      `Big Screen TV (${data.tvSize ?? "85"}")`,
      `${tvCount} unit(s)`,
      tvCount,
      "unit",
      tvRate,
    );
    addItem(
      "TV Accessory Kit",
      "Cables and accessories",
      1,
      "set",
      R.equipment.tvAccessories,
    );

    if (tvCount > 1) {
      addItem(
        "SDI Kit (Extra TVs)",
        `${tvCount - 1} extra TV(s)`,
        tvCount - 1,
        "set",
        R.equipment.sdiKit,
      );
    }
    needsTrucking = true;
  }

  // Confidence Monitors
  if (data.wantsConfidenceMonitors) {
    const cmCount = data.confidenceMonitorCount ?? 1;
    addItem(
      "Confidence Monitor",
      `${cmCount} unit(s)`,
      cmCount,
      "unit",
      R.equipment.confidenceMonitor,
    );
    needsTrucking = true;
  }

  // Lighting
  const lighting = data.lightingServices ?? [];

  if (lighting.includes("stage-wash")) {
    addItem(
      "Stage Wash Kit",
      "2hr setup, 1hr strike",
      1,
      "set",
      R.equipment.stagingWashKit,
    );
  }

  if (lighting.includes("uplights-stage")) {
    const kits = Math.max(1, Math.ceil((data.stageWashWidth ?? 10) / 10));
    addItem(
      "Stage Uplights",
      `${kits} kit(s) for ${data.stageWashWidth ?? 10}ft stage`,
      kits,
      "kit",
      R.equipment.stageUplightKit,
    );
  }

  if (lighting.includes("wireless-uplights")) {
    const packs = Math.max(1, Math.floor((data.wirelessUplightCount ?? 6) / 6));
    addItem(
      "Wireless Uplights",
      `${data.wirelessUplightCount ?? 6} units in ${packs} pack(s)`,
      packs,
      "pack",
      R.equipment.wirelessUplightPack,
    );
    needsTrucking = true;
  }

  if (lighting.includes("spotlight")) {
    addItem(
      "Spotlight / Follow-spot",
      "1hr setup, 30min strike",
      1,
      "set",
      R.equipment.spotlight,
    );
    needsTrucking = true;
  }

  // Photography
  const photo = data.photographyServices ?? [];
  if (photo.includes("photo-booth"))
    addItem(
      "Photo Booth",
      "Full event",
      1,
      "service",
      R.photography.photoBooth,
    );
  if (photo.includes("event-photo"))
    addItem(
      "Event Photography",
      "General business event",
      1,
      "service",
      R.photography.eventPhotography,
    );
  if (photo.includes("portraits"))
    addItem(
      "Portrait Photography",
      "Portrait session",
      1,
      "service",
      R.photography.portraits,
    );

  // ── 6. TRUCKING ──────────────────────────────────────────────────────────

  if (needsTrucking) {
    addItem(
      "Trucking",
      "Equipment transport & logistics",
      1,
      "flat",
      R.equipment.trucking,
    );
  }

  return { items, shouldRedirect: false };
};
