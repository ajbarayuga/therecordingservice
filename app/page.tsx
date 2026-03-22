import Link from "next/link";

export const metadata = {
  title: "The Recording Service — Production Quote Generator",
  description:
    "Get an instant production estimate for live streaming, video production, audio, and event AV. Built by The Recording Service LLC.",
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-border/50">
        <span className="text-xs font-black uppercase tracking-[0.25em] text-foreground">
          The Recording Service
        </span>
        <a
          href="mailto:contact@therecordingservice.com"
          className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
        >
          contact@therecordingservice.com
        </a>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        {/* Label pill — matches the "Step 01" label style in the quote page */}
        <div className="inline-flex items-center gap-3 mb-10 px-4 py-2 rounded-full border border-border bg-muted/30">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">
            Instant Production Estimate
          </span>
        </div>

        {/* Headline — same weight/tracking as quote page h1 */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground uppercase mb-6 max-w-3xl leading-tight">
          Production quotes,
          <br />
          <span className="text-muted-foreground/40">built in minutes.</span>
        </h1>

        {/* Sub — matches CardDescription tone */}
        <p className="text-muted-foreground text-lg max-w-sm leading-relaxed mb-14">
          Live streaming, video, audio, lighting, and event AV — configured and
          priced instantly.
        </p>

        {/* CTA — matches the "Begin Step 2" button in the quote flow exactly */}
        <Link
          href="/quote"
          className="inline-flex items-center gap-3 px-12 h-16 text-lg font-bold rounded-full shadow-2xl shadow-primary/20 transition-all active:scale-95 bg-primary text-primary-foreground hover:opacity-90"
        >
          Get a Quote
          <span className="ml-1">→</span>
        </Link>
      </section>

      {/* ── Services strip ──────────────────────────────────────────────── */}
      <section className="border-t border-border/50 px-8 py-8">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { label: "Live Streaming", desc: "Zoom, YouTube, Social" },
            { label: "Video Production", desc: "Highlight, Lecture, Podcast" },
            { label: "Audio & PA", desc: "Indoor, Outdoor, Mics" },
            { label: "Event AV", desc: "Screens, Lighting, Photo" },
          ].map(({ label, desc }) => (
            <div key={label} className="space-y-1.5">
              <p className="text-[14px] font-black text-primary">{label}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer — identical to quote page footer ──────────────────────── */}
      <footer className="border-t border-border/50 py-8">
        <div className="container max-w-2xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-muted-foreground">
          <span className="font-medium">
            © {new Date().getFullYear()} The Recording Service
          </span>
          <div className="flex items-center gap-6 font-bold uppercase tracking-widest">
            <Link
              href="/privacy"
              className="hover:text-primary transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="opacity-30">·</span>
            <Link
              href="/terms"
              className="hover:text-primary transition-colors"
            >
              Terms of Use
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

