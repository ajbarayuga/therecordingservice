"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { QuoteFormSchema, type QuoteFormData } from "@/schema/quote";
import { calculateSOW, type LineItem } from "@/lib/calculateSOW";
import { ProgressBar } from "@/components/forms/ProgressBar";
import NotSure from "@/components/forms/NotSure";
import { StepTwo } from "@/components/forms/StepTwo";
import { StepThree } from "@/components/forms/StepThree";
import { StepFourAV } from "@/components/forms/StepFourAV";
import { StepFourSummary } from "@/components/forms/StepFourSummary";
import { StepFiveSuccess } from "@/components/forms/StepFiveSuccess";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calculator,
  MessageSquare,
  ChevronLeft,
  ArrowRight,
  Loader2,
  Send,
  AlertCircle,
} from "lucide-react";

// Steps:
//  1 = Start
//  2 = Time & Place
//  3 = Video Services
//  4 = Audio & AV
//  5 = Summary (It's All About You + quote)
//  6 = Success

interface QuoteSnapshot {
  data: QuoteFormData;
  items: LineItem[];
  subtotal: number;
}

export default function QuotePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [path, setPath] = useState<"choose" | "quote" | "not-sure">("choose");
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "loading" | "error"
  >("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<QuoteSnapshot | null>(null);

  const methods = useForm<QuoteFormData>({
    resolver: zodResolver(QuoteFormSchema) as any,
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      eventType: "live",
      hasDate: false,
      eventDate: "",
      isMultiDay: false,
      venueType: "single",
      setting: "indoor",
      locationType: "office",
      startTime: "09:00",
      doorsTime: "08:30",
      hasDuration: false,
      durationHours: 4,
      studioHasDuration: false,
      studioDurationHours: 4,
      studioLocationType: "office",
      builtInAV: [],
      services: [],
      isZoomOnly: false,
      cameraSource: "bring",
      cameraCount: "1",
      streamGraphics: false,
      diyStream: false,
      videoTypes: [],
      webVideoPeople: 1,
      webVideoCount: 1,
      webVideoDuration: 3,
      podcastEpisodes: 1,
      podcastDuration: 1,
      highlightSessions: 1,
      highlightDurationHours: 4,
      lectureTalksCount: 1,
      lectureTalkDuration: "up to 1hr",
      lecturePPT: false,
      lectureFromStream: false,
      additionalAngles: false,
      angleCount: 0,
      wantsSocialShorts: false,
      socialShortsCount: 0,
      shortsSource: "recut",
      audioServices: [],
      micWirelessHandheld: 0,
      micWirelessLav: 0,
      micWiredSM58: 0,
      micWiredGooseneck: 0,
      micRockBand: false,
      micNotSure: false,
      playbackEnabled: false,
      vogEnabled: false,
      vogAlreadyCounted: false,
      monitorsEnabled: false,
      monitors: 0,
      attendance: 0,
      wantsProjector: false,
      projectorScreenCount: 1,
      wantsTVs: false,
      tvCount: 1,
      wantsConfidenceMonitors: false,
      confidenceMonitorCount: 1,
      lightingServices: [],
      stageWashWidth: 10,
      wirelessUplightCount: 6,
      photographyServices: [],
      eventName: "Untitled Event",
      isSpecQuote: false,
      venueName: "",
      hasAdditionalPOC: false,
      deliveryEmail: "",
      newsletterConsent: false,
      feedback: "",
    },
  });

  const { watch, handleSubmit, reset } = methods;
  const formData = watch();

  const handleRedirect = useCallback(() => {
    setPath("not-sure");
    setCurrentStep(1);
  }, []);

  const handleExit = useCallback(() => {
    setPath("choose");
    setCurrentStep(1);
    setSubmitStatus("idle");
    setSubmitError(null);
    setSnapshot(null);
    reset();
  }, [reset]);

  // Only treat videoTypes as active if Video Production service is selected
  const activeVideoTypes = formData.services.includes("video")
    ? (formData.videoTypes ?? [])
    : [];

  const shouldRedirectToSales =
    formData.eventType === "other" ||
    formData.venueType === "multiple" ||
    formData.locationType === "rented" ||
    formData.studioLocationType === "studio-rental" ||
    formData.isMultiDay === true ||
    (activeVideoTypes.includes("web-video") &&
      (formData.webVideoCount > 12 || formData.webVideoDuration > 3)) ||
    activeVideoTypes.includes("concert") ||
    activeVideoTypes.includes("other") ||
    (formData.services.includes("streaming") &&
      (formData.cameraCount === "2+ (call sales)" ||
        formData.cameraCount === "not sure (call sales)")) ||
    (activeVideoTypes.includes("lecture") &&
      formData.lectureTalkDuration === "longer (call sales)") ||
    formData.audioServices.includes("band") ||
    formData.audioServices.includes("recording");

  useEffect(() => {
    if (shouldRedirectToSales && path === "quote") {
      handleRedirect();
    }
  }, [shouldRedirectToSales, path, handleRedirect]);

  const stepLabel = (step: number) => {
    switch (step) {
      case 1:
        return "Get Started";
      case 2:
        return "Time & Place";
      case 3:
        return "Video Services";
      case 4:
        return "Audio & AV";
      case 5:
        return "Summary";
      default:
        return "";
    }
  };

  const onSubmit = async (data: QuoteFormData) => {
    setSubmitStatus("loading");
    setSubmitError(null);

    const result = calculateSOW(data);
    const items: LineItem[] = result?.items ?? [];
    const shouldRedirect: boolean = result?.shouldRedirect ?? false;
    if (shouldRedirect) {
      handleRedirect();
      return;
    }
    const subtotal = items.reduce(
      (sum: number, item: LineItem) => sum + item.total,
      0,
    );

    try {
      const res = await fetch("/api/send-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, items, subtotal }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? `Server error ${res.status}`);
      }

      setSnapshot({ data, items, subtotal });
      setSubmitStatus("idle");
      setCurrentStep(6);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Something went wrong.",
      );
      setSubmitStatus("error");
    }
  };

  return (
    <main className="min-h-screen pb-24 bg-background">
      {path === "quote" && (
        <ProgressBar currentStep={currentStep} isFinished={currentStep === 6} />
      )}

      <div className="container max-w-3xl pt-20 mx-auto px-2">
        {/* ── CHOOSE ─────────────────────────────────────────────────────── */}
        {path === "choose" && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 text-center">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold tracking-tight text-foreground uppercase">
                Get a Quote
              </h1>
              <p className="text-muted-foreground text-lg">
                Choose the best path for your project.
              </p>
            </div>
            <div className="grid gap-6 text-left">
              <Card
                onClick={() => setPath("quote")}
                className="group cursor-pointer p-8 hover:border-primary/50 transition-all shadow-sm hover:shadow-xl"
              >
                <div className="flex items-center gap-6">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                    <Calculator className="h-7 w-7" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl font-bold">
                      Guided Estimator
                    </CardTitle>
                    <CardDescription>
                      Automated quote for standard setups.
                    </CardDescription>
                  </div>
                  <ArrowRight className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                </div>
              </Card>

              <Card
                onClick={() => setPath("not-sure")}
                className="group cursor-pointer p-8 hover:border-foreground/50 transition-all shadow-sm hover:shadow-xl"
              >
                <div className="flex items-center gap-6">
                  <div className="h-14 w-14 rounded-2xl bg-secondary flex items-center justify-center">
                    <MessageSquare className="h-7 w-7" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl font-bold">
                      Manual Inquiry
                    </CardTitle>
                    <CardDescription>
                      Custom support for complex productions.
                    </CardDescription>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ── NOT SURE ───────────────────────────────────────────────────── */}
        {path === "not-sure" && (
          <div className="animate-in fade-in duration-500">
            <Button
              variant="ghost"
              onClick={() => setPath("choose")}
              className="mb-8 font-bold text-xs uppercase tracking-widest text-muted-foreground hover:text-primary"
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> Back to selection
            </Button>
            <Card className="rounded-[2rem] overflow-hidden border-border/50 shadow-2xl">
              <CardHeader className="bg-muted/20 p-8 border-b">
                <CardTitle className="text-3xl font-bold">
                  Contact Sales
                </CardTitle>
                <CardDescription>
                  Your project requires a custom consultation.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <NotSure />
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── QUOTE ─────────────────────────────────────────────────────── */}
        {path === "quote" && (
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
              {currentStep < 6 && (
                <div className="flex justify-between items-end animate-in fade-in">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                      Step 0{currentStep}
                    </p>
                    <h2 className="text-4xl font-bold">
                      {stepLabel(currentStep)}
                    </h2>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleExit}
                    className="rounded-full h-8 opacity-50 hover:opacity-100 px-4 text-[10px] font-bold uppercase tracking-widest"
                  >
                    Exit
                  </Button>
                </div>
              )}

              {/* Step 1 — Start */}
              {currentStep === 1 && (
                <Card className="p-20 text-center border-dashed border-2 bg-muted/5 rounded-[3rem] animate-in zoom-in-95 duration-500">
                  <p className="text-xl mb-10 text-muted-foreground font-medium">
                    Ready to configure your production?
                  </p>
                  <Button
                    type="button"
                    size="lg"
                    className="px-12 h-16 text-lg font-bold rounded-full shadow-2xl shadow-primary/20 transition-all active:scale-95"
                    onClick={() => setCurrentStep(2)}
                  >
                    Begin <ArrowRight className="ml-3 w-6 h-6" />
                  </Button>
                </Card>
              )}

              {/* Step 2 — Time & Place */}
              {currentStep === 2 && (
                <div className="animate-in fade-in duration-700">
                  <StepTwo onRedirect={handleRedirect} />
                  <div className="flex justify-between mt-16 pt-8 border-t border-border/50">
                    <Button
                      variant="ghost"
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="font-bold text-muted-foreground"
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="px-12 h-12 rounded-full font-bold"
                    >
                      Next: Video Services
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3 — Video Services */}
              {currentStep === 3 && (
                <div className="animate-in fade-in duration-700">
                  <StepThree onRedirect={handleRedirect} />
                  <div className="flex justify-between mt-16 pt-8 border-t border-border/50">
                    <Button
                      variant="ghost"
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="font-bold text-muted-foreground"
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setCurrentStep(4)}
                      className="px-12 h-12 rounded-full font-bold shadow-lg"
                    >
                      Next: Audio & AV
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4 — Audio & AV */}
              {currentStep === 4 && (
                <div className="animate-in fade-in duration-700">
                  <StepFourAV onRedirect={handleRedirect} />
                  <div className="flex justify-between mt-16 pt-8 border-t border-border/50">
                    <Button
                      variant="ghost"
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="font-bold text-muted-foreground"
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setCurrentStep(5)}
                      className="px-12 h-12 rounded-full font-bold shadow-lg"
                    >
                      Next: Summary
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 5 — Summary */}
              {currentStep === 5 && (
                <div className="animate-in fade-in duration-700">
                  <StepFourSummary onRedirect={handleRedirect} />

                  {submitStatus === "error" && submitError && (
                    <Alert variant="destructive" className="mt-6 rounded-2xl">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{submitError}</AlertDescription>
                    </Alert>
                  )}

                  <div className="flex justify-between mt-8 pt-8 border-t border-border/50">
                    <Button
                      variant="ghost"
                      type="button"
                      onClick={() => setCurrentStep(4)}
                      className="font-bold text-muted-foreground"
                      disabled={submitStatus === "loading"}
                    >
                      Back to Audio & AV
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitStatus === "loading"}
                      className="px-12 h-12 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-xl shadow-green-500/20 transition-all active:scale-95 font-bold flex items-center gap-2"
                    >
                      {submitStatus === "loading" ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Sending…
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Email me this quote!
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 6 — Success */}
              {currentStep === 6 && snapshot && (
                <div className="animate-in zoom-in-95 duration-500">
                  <StepFiveSuccess
                    onReset={handleExit}
                    quoteData={snapshot.data}
                    items={snapshot.items}
                    subtotal={snapshot.subtotal}
                  />
                </div>
              )}
            </form>
          </FormProvider>
        )}
      </div>

      {/* ── Site footer ─────────────────────────────────────────────────── */}
      <footer className="mt-24 border-t py-8">
        <div className="container max-w-3xl mx-auto px-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-muted-foreground">
          <span className="font-medium">
            © {new Date().getFullYear()} The Recording Service LLC
          </span>
          <div className="flex items-center gap-6 font-bold uppercase tracking-widest">
            <a href="/privacy" className="hover:text-primary transition-colors">
              Privacy Policy
            </a>
            <span className="opacity-30">·</span>
            <a href="/terms" className="hover:text-primary transition-colors">
              Terms of Use
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
