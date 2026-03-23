"use client";

import { useFormContext } from "react-hook-form";
import { QuoteFormData } from "@/schema/quote";
import { useQuoteCalculator } from "@/hooks/useQuoteCalculator";
import { fmt } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  InfoIcon,
  Receipt,
  ShieldCheck,
  Clock,
  FileText,
  Lightbulb,
  User,
  Building2,
  MapPin,
  Phone,
  Users,
  Mail,
  Send,
  MessageSquareHeart,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

export function StepFourSummary({ onRedirect }: { onRedirect: () => void }) {
  const { items, subtotal, shouldRedirect } = useQuoteCalculator();
  const {
    register,
    watch,
    setValue,
    formState: { errors },
    trigger,
  } = useFormContext<QuoteFormData>();

  const formData = watch();
  const showMicUpNote =
    formData.videoTypes?.includes("podcast") ||
    formData.videoTypes?.includes("web-video");

  if (shouldRedirect) {
    return (
      <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
        <Alert
          variant="destructive"
          className="bg-destructive/5 border-destructive/20 p-8 rounded-[2rem] border-2"
        >
          <InfoIcon className="h-6 w-6" />
          <AlertTitle className="text-xl font-bold mb-2">
            Custom Consultation Required
          </AlertTitle>
          <AlertDescription className="text-sm opacity-90 leading-relaxed">
            Your project parameters fall outside our automated estimator. A
            Producer needs to review this manually.
          </AlertDescription>
        </Alert>
        <button
          onClick={onRedirect}
          className="w-full py-5 bg-primary text-primary-foreground font-bold rounded-full hover:scale-[1.02] transition-all uppercase tracking-widest text-xs"
        >
          Talk to a Producer →
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 pb-12">
      {/* --- SECTION 1: IT'S ALL ABOUT YOU --- */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-black tracking-tighter uppercase italic">
              It's All About You
            </h2>
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-bold">
              Final Event & Contact Details
            </p>
          </div>

          <div className="flex bg-muted/50 p-1 rounded-xl border w-fit">
            <button
              type="button"
              onClick={() => setValue("isSpecQuote", false)}
              className={`px-4 py-2 text-[10px] font-bold rounded-lg transition-all ${!formData.isSpecQuote ? "bg-background shadow-sm text-primary" : "text-muted-foreground"}`}
            >
              REAL SALE
            </button>
            <button
              type="button"
              onClick={() => setValue("isSpecQuote", true)}
              className={`px-4 py-2 text-[10px] font-bold rounded-lg transition-all ${formData.isSpecQuote ? "bg-background shadow-sm text-primary" : "text-muted-foreground"}`}
            >
              SPEC QUOTE
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-black tracking-widest text-primary">
                Event Name
              </Label>
              <Input
                {...register("eventName")}
                placeholder="Name of your event..."
                className="rounded-xl bg-background border-2"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-black tracking-widest text-primary">
                Venue Name & Info
              </Label>
              <div className="flex items-center gap-3 p-3 bg-background border-2 rounded-xl">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <Input
                  {...register("venueName")}
                  placeholder="Where is it happening?"
                  className="border-none p-0 focus-visible:ring-0 h-auto"
                />
              </div>
            </div>
          </div>

          <div className="transition-all duration-500">
            {formData.isSpecQuote ? (
              <div className="h-full flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-[2rem] bg-muted/5 text-center">
                <ShieldCheck className="w-8 h-8 text-muted-foreground mb-2 opacity-20" />
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                  Spec Quote Mode
                </p>
                <p className="text-[9px] text-muted-foreground italic">
                  Contact info skipped for estimation
                </p>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-2">
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-3 p-3 bg-background border-2 rounded-xl">
                    <User className="w-4 h-4 text-primary" />
                    <Input
                      {...register("clientName")}
                      placeholder="Full Name"
                      className="border-none p-0 focus-visible:ring-0 h-auto text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-background border-2 rounded-xl">
                    <Phone className="w-4 h-4 text-primary" />
                    <Input
                      {...register("clientPhone")}
                      placeholder="Phone Number"
                      className="border-none p-0 focus-visible:ring-0 h-auto text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-background border-2 rounded-xl">
                    <Building2 className="w-4 h-4 text-primary" />
                    <Input
                      {...register("organization")}
                      placeholder="Organization / Company"
                      className="border-none p-0 focus-visible:ring-0 h-auto text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {!formData.isSpecQuote && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="poc"
                checked={formData.hasAdditionalPOC}
                onCheckedChange={(c) => setValue("hasAdditionalPOC", !!c)}
              />
              <Label
                htmlFor="poc"
                className="text-xs font-bold cursor-pointer flex items-center gap-2"
              >
                <Users className="w-4 h-4" /> Add additional points of contact?
              </Label>
            </div>
            {formData.hasAdditionalPOC && (
              <Input
                {...register("additionalPOC")}
                placeholder="Name and Email of additional POC"
                className="rounded-xl animate-in slide-in-from-top-2"
              />
            )}
          </div>
        )}
      </div>

      {/* --- SECTION 2: QUOTE BREAKDOWN --- */}
      <div className="space-y-6 pt-10 border-t-4 border-double">
        <div className="flex items-center gap-3">
          <Receipt className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-lg uppercase tracking-widest">
            Quote Summary
          </h3>
        </div>

        <div className="rounded-[2rem] border border-border/50 overflow-hidden bg-card shadow-sm">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead className="font-bold py-4 pl-6">
                  Service Detail
                </TableHead>
                <TableHead className="text-right font-bold py-4">Qty</TableHead>
                <TableHead className="text-right font-bold py-4 pr-6">
                  Amount
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, idx) => (
                <TableRow key={idx} className="border-border/40">
                  <TableCell className="py-5 pl-6">
                    <p className="font-bold text-sm leading-tight">
                      {item.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
                      {item.description}
                    </p>
                  </TableCell>
                  <TableCell className="text-right text-xs font-medium text-muted-foreground">
                    {item.quantity} {item.unit}
                  </TableCell>
                  <TableCell className="text-right font-bold py-5 pr-6">
                    {fmt(item.total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* --- SECTION 3: TOTAL & PRODUCTION NOTES --- */}
      <div className="flex justify-between items-center p-8 bg-primary text-primary-foreground rounded-[2.5rem] shadow-2xl shadow-primary/20">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">
            Estimated Investment
          </p>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 opacity-70" />
            <p className="text-[10px] font-medium opacity-70 italic">
              Pending review
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-5xl font-black tracking-tighter">
            {fmt(subtotal)}
          </p>
          <p className="text-[10px] uppercase font-bold opacity-60">
            VAT Inclusive
          </p>
        </div>
      </div>

      {showMicUpNote && (
        <Alert className="bg-orange-50 border-orange-200 rounded-2xl border-2 py-6">
          <Lightbulb className="h-5 w-5 text-orange-600" />
          <AlertTitle className="text-orange-800 font-bold uppercase tracking-wider text-xs">
            Production Note
          </AlertTitle>
          <AlertDescription className="text-orange-700 text-sm">
            Please ensure all <strong>guests arrive 15 minutes early</strong> to
            be properly mic’d up.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5 border-dashed border-2 bg-muted/5 rounded-2xl flex gap-4 items-start">
          <FileText className="w-5 h-5 text-primary shrink-0 mt-1" />
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider">
              ROS Requirement
            </p>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Final Run of Show must be submitted 3 days prior.
            </p>
          </div>
        </Card>
        <Card className="p-5 border-dashed border-2 bg-muted/5 rounded-2xl flex gap-4 items-start">
          <Clock className="w-5 h-5 text-primary shrink-0 mt-1" />
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider">
              Built-in Tech
            </p>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Broken built-in venue tech will require a revised quote.
            </p>
          </div>
        </Card>
      </div>

      {/* --- SECTION 4: FINAL DELIVERY & FEEDBACK (Step 5 Logic) --- */}
      <div className="space-y-8 pt-10 border-t-2 border-primary/20">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-black tracking-tight uppercase italic text-primary">
            Ready to Send?
          </h3>
          <p className="text-muted-foreground text-[10px] uppercase tracking-widest font-bold">
            Email your custom estimate for {fmt(subtotal)}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-primary">
                Enter Your Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  {...register("deliveryEmail")}
                  type="email"
                  placeholder="you@example.com"
                  onBlur={() => trigger("deliveryEmail")}
                  className={`pl-11 h-12 rounded-xl border-2 focus:border-primary transition-colors ${
                    errors.deliveryEmail
                      ? "border-destructive focus:border-destructive"
                      : "border-primary/10"
                  }`}
                />
              </div>
              {errors.deliveryEmail && (
                <p className="text-xs text-destructive font-medium">
                  {errors.deliveryEmail.message}
                </p>
              )}
            </div>

            <div className="flex items-start space-x-3 p-4 bg-muted/30 rounded-2xl border-2 border-transparent hover:border-primary/10 transition-all cursor-pointer">
              <Checkbox
                id="newsletter"
                checked={formData.newsletterConsent}
                onCheckedChange={(c) => setValue("newsletterConsent", !!c)}
              />
              <Label
                htmlFor="newsletter"
                className="text-xs leading-tight cursor-pointer font-medium opacity-80"
              >
                Keep me updated with newsletters on production tips and gear.
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 opacity-70">
              <MessageSquareHeart className="w-4 h-4 text-primary" />
              How can we improve this tool?
            </Label>
            <Textarea
              {...register("feedback")}
              placeholder="Your feedback helps us grow..."
              className="min-h-[115px] rounded-xl bg-muted/20 border-2 border-transparent focus:border-primary/20 transition-all text-sm italic"
            />
          </div>
        </div>
      </div>

      <p className="text-center text-[10px] text-muted-foreground px-12 italic leading-relaxed">
        This is an automated estimate generated by The Recording Service.
      </p>
    </div>
  );
}
