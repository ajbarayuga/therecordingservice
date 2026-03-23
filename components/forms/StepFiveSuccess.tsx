"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Calendar,
  FileDown,
  ArrowRight,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { QuoteFormData } from "@/schema/quote";
import type { LineItem } from "@/lib/calculateSOW";

interface StepFiveSuccessProps {
  onReset: () => void;
  quoteData: QuoteFormData;
  items: LineItem[];
  subtotal: number;
  warning?: string;
  refNumber: string;
}

export function StepFiveSuccess({
  onReset,
  quoteData,
  items,
  subtotal,
  warning,
  refNumber,
}: StepFiveSuccessProps) {
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const handleDownload = async () => {
    setDownloading(true);
    setDownloadError(null);

    try {
      const res = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...quoteData, items, subtotal }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? `Server error ${res.status}`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `quote-${(quoteData.eventName ?? "estimate")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setDownloadError(
        err instanceof Error
          ? err.message
          : "Download failed. Please try again.",
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in zoom-in-95 duration-500 pb-12 text-center">
      <div className="space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-2">
          <CheckCircle2 className="w-10 h-10 text-primary animate-bounce" />
        </div>
        <h2 className="text-4xl font-black tracking-tighter uppercase italic">
          Quote Sent!
        </h2>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50">
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
            Ref:
          </span>
          <span className="text-[11px] font-black tracking-widest text-foreground">
            {refNumber}
          </span>
        </div>
        <p className="text-muted-foreground text-xs uppercase tracking-[0.2em] max-w-xs mx-auto leading-relaxed">
          Check your inbox. Your custom estimate is flying your way.
        </p>
        {warning && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-sm text-amber-800 max-w-sm mx-auto">
            ⚠️ {warning}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
        <Card className="p-6 border-2 border-primary/10 hover:border-primary/30 transition-all group space-y-3">
          <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <h4 className="font-bold uppercase tracking-tight text-sm">
            Lock in your date
          </h4>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Ready to move forward? Schedule a 15-minute production sync to
            finalize the details.
          </p>
          <Button
            variant="link"
            className="p-0 h-auto text-primary text-[10px] font-black uppercase tracking-widest group-hover:gap-2 transition-all"
          >
            Book Sync <ArrowRight className="w-3 h-3" />
          </Button>
        </Card>

        <Card className="p-6 border-2 border-dashed bg-muted/20 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center">
            <FileDown className="w-5 h-5 text-muted-foreground" />
          </div>
          <h4 className="font-bold uppercase tracking-tight text-sm text-muted-foreground">
            Download PDF
          </h4>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Missed the email? Download a copy of this estimate directly to your
            device.
          </p>
          {downloadError && (
            <p className="text-[10px] text-destructive font-medium">
              {downloadError}
            </p>
          )}
          <Button
            variant="outline"
            onClick={handleDownload}
            disabled={downloading}
            className="w-full text-[10px] font-black uppercase tracking-widest rounded-lg h-8 flex items-center justify-center gap-2"
          >
            {downloading ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                Generating…
              </>
            ) : (
              "Download Now"
            )}
          </Button>
        </Card>
      </div>

      <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/10 flex items-center gap-4 text-left">
        <Sparkles className="w-6 h-6 text-primary shrink-0" />
        <p className="text-[11px] font-medium leading-relaxed">
          <strong>A Producer is reviewing your request.</strong> If your event
          has complex AV needs, we'll reach out within 24 hours to fine-tune the
          numbers.
        </p>
      </div>

      <button
        onClick={onReset}
        className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-colors cursor-pointer"
      >
        ← Create another quote
      </button>
    </div>
  );
}
