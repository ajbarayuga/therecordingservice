import { useFormContext } from "react-hook-form";
import { QuoteFormData } from "@/schema/quote";
import { calculateSOW, LineItem } from "@/lib/calculateSOW";
import { useMemo } from "react";

// ─── LOOP 6 FIX ────────────────────────────────────────────────────────────────
// BUG: The hook called watch() with no arguments, which returns the entire form
// state as a single object. React-hook-form's watch() returns a NEW object
// reference on every render — it does NOT perform deep equality checks before
// returning. Passing that object as the sole dependency of useMemo meant:
//
//   watch() → new object ref → useMemo re-runs → calculateSOW() called →
//   returns new items[] array → new subtotal → hook returns new object →
//   StepFourSummary re-renders → watch() called again → new object ref → …
//
// This was a silent performance loop (not a crash loop), but it guaranteed
// that useMemo NEVER actually memoised anything — calculateSOW ran on every
// single render regardless of whether any form value changed.
//
// FIX: Subscribe to individual primitive/scalar field values using watch([])
// with an explicit field list. RHF only triggers re-renders when one of these
// specific values changes, and the returned values are primitives or stable
// arrays — not a fresh top-level object. useMemo then has a stable, meaningful
// dependency list and actually prevents redundant recalculation.
//
// For the fields that are arrays (builtInAV, services, videoTypes), we join
// them to a string for the dep array to keep referential stability, and we
// re-read the full array from getValues() inside the memo body.
// ────────────────────────────────────────────────────────────────────────────────
export const useQuoteCalculator = () => {
  const { watch, getValues } = useFormContext<QuoteFormData>();

  // Subscribe only to the scalar fields that calculateSOW actually branches on.
  // Each of these returns a primitive — safe as useMemo deps.
  const [
    eventType,
    isMultiDay,
    venueType,
    locationType,
    hasDuration,
    durationHours,
    cameraCount,
    cameraSource,
    streamGraphics,
    diyStream,
    webVideoCount,
    webVideoDuration,
    podcastEpisodes,
    webVideoCount2, // alias — we only need it once; listed for completeness
    highlightDurationHours,
    lectureTalksCount,
    lectureTalkDuration,
    lecturePPT,
    socialShortsCount,
    shortsSource,
  ] = watch([
    "eventType",
    "isMultiDay",
    "venueType",
    "locationType",
    "hasDuration",
    "durationHours",
    "cameraCount",
    "cameraSource",
    "streamGraphics",
    "diyStream",
    "webVideoCount",
    "webVideoDuration",
    "podcastEpisodes",
    "webVideoCount", // intentional duplicate slot — see alias above
    "highlightDurationHours",
    "lectureTalksCount",
    "lectureTalkDuration",
    "lecturePPT",
    "socialShortsCount",
    "shortsSource",
  ]);

  // For array fields, join to a string for dep stability.
  // The actual array values are read inside the memo via getValues().
  const servicesKey = watch("services").join(",");
  const videoTypesKey = watch("videoTypes").join(",");
  const builtInAVKey = watch("builtInAV").join(",");

  return useMemo(() => {
    // Re-read the full form snapshot via getValues() only when one of the
    // tracked scalars or array-keys above has actually changed.
    const allValues = getValues();
    const { items, shouldRedirect } = calculateSOW(allValues);
    const subtotal = items.reduce(
      (sum: number, item: LineItem) => sum + item.total,
      0,
    );
    return { items, subtotal, shouldRedirect };
  }, [
    // Scalar fields — primitives, safe as deps
    eventType,
    isMultiDay,
    venueType,
    locationType,
    hasDuration,
    durationHours,
    cameraCount,
    cameraSource,
    streamGraphics,
    diyStream,
    webVideoCount,
    webVideoDuration,
    podcastEpisodes,
    highlightDurationHours,
    lectureTalksCount,
    lectureTalkDuration,
    lecturePPT,
    socialShortsCount,
    shortsSource,
    // Array-derived string keys — stable because join() returns a primitive
    servicesKey,
    videoTypesKey,
    builtInAVKey,
    // getValues is a stable ref from RHF — safe to include
    getValues,
  ]);
};
