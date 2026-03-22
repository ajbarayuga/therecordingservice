"use client";

import { useFormContext } from "react-hook-form";
import { QuoteFormData } from "@/schema/quote";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useEffect, useRef, useCallback } from "react";
import {
  Calendar,
  Monitor,
  Clock,
  Video,
  Home,
  HelpCircle,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function StepTwo({ onRedirect }: { onRedirect: () => void }) {
  const { register, watch, setValue, getValues } =
    useFormContext<QuoteFormData>();
  const formData = watch();

  // Stable redirect guard
  const lastRedirectValues = useRef("");
  useEffect(() => {
    const currentValues = `${formData.eventType}-${formData.isMultiDay}-${formData.venueType}-${formData.studioLocationType}`;
    const shouldRedirect =
      formData.eventType === "other" ||
      formData.isMultiDay ||
      formData.venueType === "multiple" ||
      formData.studioLocationType === "studio-rental";

    if (shouldRedirect && lastRedirectValues.current !== currentValues) {
      lastRedirectValues.current = currentValues;
      onRedirect();
    }
  }, [
    formData.eventType,
    formData.isMultiDay,
    formData.venueType,
    formData.studioLocationType,
    onRedirect,
  ]);

  // Stable toggleAV — reads current value at call-time via getValues()
  const toggleAV = useCallback(
    (id: string) => {
      const current = getValues("builtInAV") ?? [];
      const next = current.includes(id)
        ? current.filter((i: string) => i !== id)
        : [...current, id];
      setValue("builtInAV", next, { shouldValidate: false, shouldDirty: true });
    },
    [getValues, setValue],
  );

  const categories = [
    { id: "live", label: "Live Event", icon: Video },
    { id: "studio", label: "Studio-Style Recording", icon: Home },
    { id: "other", label: "Other", icon: HelpCircle },
  ] as const;

  return (
    <div className="space-y-12 pb-10">
      {/* ── Event Type ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className={cn(
              "cursor-pointer border-2 transition-all duration-300 rounded-[2rem] min-h-[140px] flex flex-col items-center justify-center text-center p-6",
              formData.eventType === cat.id
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border hover:border-primary/20 bg-card",
            )}
            onClick={() => setValue("eventType", cat.id as any)}
          >
            <cat.icon
              className={cn(
                "w-6 h-6 mb-3",
                formData.eventType === cat.id
                  ? "text-primary"
                  : "text-muted-foreground",
              )}
            />
            <span className="font-bold uppercase tracking-tight text-[11px] leading-tight select-none">
              {cat.label}
            </span>
            <div
              className={cn(
                "w-4 h-4 mt-3 rounded-full border-2 flex items-center justify-center",
                formData.eventType === cat.id
                  ? "border-primary"
                  : "border-muted",
              )}
            >
              {formData.eventType === cat.id && (
                <div className="w-2 h-2 rounded-full bg-primary" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── LIVE EVENT BRANCH ────────────────────────────────────────────── */}
      {formData.eventType === "live" && (
        <div className="space-y-8 p-8 border-2 border-primary/20 rounded-[2.5rem] bg-primary/5">
          {/* Date */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2 font-black uppercase tracking-widest text-[10px] text-primary">
              <Calendar className="w-4 h-4" /> Set date yet?
            </Label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setValue("hasDate", true)}
                className={cn(
                  "flex-1 p-4 rounded-2xl border-2 font-bold transition-all text-sm",
                  formData.hasDate
                    ? "border-primary bg-background text-primary"
                    : "border-border bg-background/50 text-muted-foreground",
                )}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setValue("hasDate", false)}
                className={cn(
                  "flex-1 p-4 rounded-2xl border-2 font-bold transition-all text-sm",
                  !formData.hasDate
                    ? "border-primary bg-background text-primary"
                    : "border-border bg-background/50 text-muted-foreground",
                )}
              >
                TBD
              </button>
            </div>
            {formData.hasDate && (
              <Input
                type="date"
                {...register("eventDate")}
                className="max-w-xs bg-background rounded-xl border-2 focus:ring-0"
              />
            )}
          </div>

          {/* Multi-day */}
          <div
            className="flex items-center space-x-3 p-5 bg-background border-2 rounded-2xl cursor-pointer select-none"
            onClick={() => setValue("isMultiDay", !formData.isMultiDay)}
          >
            <div
              className={cn(
                "w-5 h-5 rounded border-2 flex items-center justify-center",
                formData.isMultiDay
                  ? "bg-primary border-primary"
                  : "border-border",
              )}
            >
              {formData.isMultiDay && (
                <div className="w-2 h-2 bg-white rounded-sm" />
              )}
            </div>
            <div className="flex-1">
              <span className="font-bold text-sm">
                Multiple or Additional Days?
              </span>
              <p className="text-[10px] text-destructive font-bold mt-0.5">
                → Redirects to Sales
              </p>
            </div>
          </div>

          {/* Venue count */}
          <div className="space-y-3">
            <Label className="font-black uppercase tracking-widest text-[10px] text-primary">
              One venue or multiple?
            </Label>
            <div className="grid grid-cols-3 gap-3">
              {(
                [
                  { value: "single", label: "Single Venue" },
                  { value: "multiple", label: "Multiple Venues →Sales" },
                  { value: "tbd", label: "TBD" },
                ] as const
              ).map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setValue("venueType", value)}
                  className={cn(
                    "p-3 rounded-xl border-2 font-bold text-xs uppercase transition-all",
                    formData.venueType === value
                      ? "border-primary bg-background text-primary"
                      : "border-border text-muted-foreground",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Setting */}
          <div className="space-y-3">
            <Label className="font-black uppercase tracking-widest text-[10px] text-primary">
              Setting
            </Label>
            <div className="flex gap-3">
              {["indoor", "outdoor"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setValue("setting", s as any)}
                  className={cn(
                    "flex-1 p-3 rounded-xl border-2 font-bold text-xs uppercase transition-all",
                    formData.setting === s
                      ? "border-primary bg-background text-primary"
                      : "border-border text-muted-foreground",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Start time + Doors time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="flex items-center gap-2 font-black uppercase tracking-widest text-[10px] text-primary">
                <Clock className="w-4 h-4" /> Show Start Time
              </Label>
              <Input
                type="time"
                {...register("startTime")}
                className="bg-background h-12 rounded-xl border-2"
              />
            </div>
            <div className="space-y-3">
              <Label className="flex items-center gap-2 font-black uppercase tracking-widest text-[10px] text-primary">
                <Clock className="w-4 h-4" /> Doors Time
                <span className="text-muted-foreground font-normal normal-case tracking-normal text-[9px]">
                  (room ready — default 30 min before show)
                </span>
              </Label>
              <Input
                type="time"
                {...register("doorsTime")}
                className="bg-background h-12 rounded-xl border-2"
              />
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-3">
            <Label className="font-black uppercase tracking-widest text-[10px] text-primary">
              Do you have start/end times for the event?
            </Label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setValue("hasDuration", true)}
                className={cn(
                  "flex-1 p-3 rounded-xl border-2 font-bold text-sm transition-all",
                  formData.hasDuration
                    ? "border-primary bg-background text-primary"
                    : "border-border text-muted-foreground",
                )}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setValue("hasDuration", false)}
                className={cn(
                  "flex-1 p-3 rounded-xl border-2 font-bold text-sm transition-all",
                  !formData.hasDuration
                    ? "border-primary bg-background text-primary"
                    : "border-border text-muted-foreground",
                )}
              >
                TBD
              </button>
            </div>
            {formData.hasDuration && (
              <div className="flex items-center gap-3 mt-2">
                <Input
                  type="number"
                  {...register("durationHours")}
                  className="max-w-[100px] bg-background rounded-xl border-2"
                />
                <span className="text-sm text-muted-foreground font-medium">
                  hours
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── STUDIO RECORDING BRANCH ──────────────────────────────────────── */}
      {formData.eventType === "studio" && (
        <div className="space-y-8 p-8 border-2 border-primary/20 rounded-[2.5rem] bg-primary/5">
          {/* Date */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2 font-black uppercase tracking-widest text-[10px] text-primary">
              <Calendar className="w-4 h-4" /> Date in mind, or TBD?
            </Label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setValue("hasDate", true)}
                className={cn(
                  "flex-1 p-4 rounded-2xl border-2 font-bold transition-all text-sm",
                  formData.hasDate
                    ? "border-primary bg-background text-primary"
                    : "border-border bg-background/50 text-muted-foreground",
                )}
              >
                Yes, I have a date
              </button>
              <button
                type="button"
                onClick={() => setValue("hasDate", false)}
                className={cn(
                  "flex-1 p-4 rounded-2xl border-2 font-bold transition-all text-sm",
                  !formData.hasDate
                    ? "border-primary bg-background text-primary"
                    : "border-border bg-background/50 text-muted-foreground",
                )}
              >
                TBD
              </button>
            </div>
            {formData.hasDate && (
              <Input
                type="date"
                {...register("eventDate")}
                className="max-w-xs bg-background rounded-xl border-2 focus:ring-0"
              />
            )}
          </div>

          {/* Recording duration */}
          <div className="space-y-3">
            <Label className="font-black uppercase tracking-widest text-[10px] text-primary">
              Recording duration in mind, or TBD?
            </Label>
            <p className="text-[10px] text-muted-foreground">
              If TBD, we'll suggest an ideal workplan based on your
              deliverables.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setValue("studioHasDuration", true)}
                className={cn(
                  "flex-1 p-3 rounded-xl border-2 font-bold text-sm transition-all",
                  formData.studioHasDuration
                    ? "border-primary bg-background text-primary"
                    : "border-border text-muted-foreground",
                )}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setValue("studioHasDuration", false)}
                className={cn(
                  "flex-1 p-3 rounded-xl border-2 font-bold text-sm transition-all",
                  !formData.studioHasDuration
                    ? "border-primary bg-background text-primary"
                    : "border-border text-muted-foreground",
                )}
              >
                TBD
              </button>
            </div>
            {formData.studioHasDuration && (
              <div className="flex items-center gap-3 mt-2">
                <Input
                  type="number"
                  step="0.5"
                  {...register("studioDurationHours")}
                  className="max-w-[100px] bg-background rounded-xl border-2"
                />
                <span className="text-sm text-muted-foreground font-medium">
                  hours
                </span>
              </div>
            )}
          </div>

          {/* Location type */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 font-black uppercase tracking-widest text-[10px] text-primary">
              <MapPin className="w-4 h-4" /> Record at your location, or rent
              studio space?
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setValue("studioLocationType", "office")}
                className={cn(
                  "p-4 rounded-2xl border-2 font-bold text-xs uppercase transition-all text-left",
                  formData.studioLocationType === "office"
                    ? "border-primary bg-background text-primary"
                    : "border-border text-muted-foreground",
                )}
              >
                <div>Your Office / Hotel / Location</div>
                <div className="font-normal normal-case text-[10px] mt-1 opacity-70">
                  We come to you
                </div>
              </button>
              <button
                type="button"
                onClick={() => setValue("studioLocationType", "studio-rental")}
                className={cn(
                  "p-4 rounded-2xl border-2 font-bold text-xs uppercase transition-all text-left",
                  formData.studioLocationType === "studio-rental"
                    ? "border-destructive bg-destructive/5 text-destructive"
                    : "border-border text-muted-foreground",
                )}
              >
                <div>Rent Studio Space</div>
                <div className="font-normal normal-case text-[10px] mt-1 opacity-70">
                  → Redirects to Sales
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── VENUE EQUIPMENT CHECK ────────────────────────────────────────── */}
      <div className="p-8 border-2 border-primary/20 rounded-[3rem] bg-primary/5 space-y-6">
        <div className="space-y-1">
          <h3 className="font-black uppercase text-[16px] text-primary flex items-center gap-2 mb-4">
            <Monitor className="w-4 h-4" /> Venue Equipment Check
          </h3>
          <p className="text-[12px] text-muted-foreground leading-relaxed">
            Does your venue/location have built-in AV we could leverage for
            better value? A Producer can do a free site visit to evaluate and
            discount your quote accordingly.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            {
              id: "cameras",
              l: "Cameras / Video",
              note: "Removes camera kit from quote",
            },
            {
              id: "audio",
              l: "Sound System",
              note: "Removes sound kit & mics",
            },
            {
              id: "projector",
              l: "Projector & Screen",
              note: "Removes PJ & Screen line item",
            },
            { id: "tvs", l: "TVs", note: "Removes TV line item" },
          ].map((item) => {
            const isChecked = formData.builtInAV?.includes(item.id);
            return (
              <div
                key={item.id}
                className={cn(
                  "flex items-start space-x-3 p-4 bg-background border-2 rounded-2xl cursor-pointer transition-all select-none",
                  isChecked
                    ? "border-primary ring-1 ring-primary/10 shadow-sm"
                    : "border-border hover:border-primary/20",
                )}
                onClick={() => toggleAV(item.id)}
              >
                <div
                  className={cn(
                    "w-5 h-5 mt-0.5 rounded-md border-2 flex items-center justify-center transition-colors shrink-0",
                    isChecked ? "bg-primary border-primary" : "border-muted",
                  )}
                >
                  {isChecked && <div className="w-2 h-2 bg-white rounded-sm" />}
                </div>
                <div>
                  <span className="font-bold text-xs uppercase tracking-tight block">
                    {item.l}
                  </span>
                  <span className="text-[9px] text-muted-foreground">
                    {item.note}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
