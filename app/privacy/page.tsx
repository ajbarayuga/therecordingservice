import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — The Recording Service",
  description:
    "How The Recording Service collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  const effectiveDate = "January 1, 2025";

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Back */}
        <Link
          href="/quote"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors mb-12"
        >
          <ArrowLeft className="w-3 h-3" /> Back to Quote
        </Link>

        {/* Header */}
        <div className="mb-12 pb-8 border-b">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-3">
            The Recording Service LLC
          </p>
          <h1 className="text-4xl font-black tracking-tight uppercase mb-4">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground">
            Effective date: {effectiveDate}
          </p>
        </div>

        {/* Intro */}
        <div className="prose prose-sm max-w-none space-y-8 text-sm leading-relaxed text-foreground/80">
          <p>
            The Recording Service LLC ("we," "us," or "our") operates the Quote
            Generator tool at this website. This Privacy Policy explains what
            personal information we collect when you use the Quote Generator,
            how we use it, and your rights regarding that information. We are
            committed to protecting your privacy in accordance with applicable
            United States federal and state privacy laws.
          </p>

          {/* Section 1 */}
          <section>
            <h2 className="text-base font-black uppercase tracking-widest mb-4 text-foreground">
              1. Information We Collect
            </h2>
            <p className="mb-3">
              When you use our Quote Generator, we may collect the following
              information depending on the path you choose:
            </p>

            <div className="bg-muted/30 rounded-2xl p-6 space-y-4">
              <div>
                <p className="font-bold text-foreground text-xs uppercase tracking-widest mb-2">
                  Guided Estimator (Quote Generator)
                </p>
                <ul className="space-y-1.5 text-muted-foreground">
                  <li>• Full name</li>
                  <li>• Phone number</li>
                  <li>• Email address</li>
                  <li>• Organization or company name</li>
                  <li>• Event name and date</li>
                  <li>• Venue name and location</li>
                  <li>
                    • Event configuration details (services selected,
                    attendance, equipment preferences)
                  </li>
                  <li>• Newsletter consent preference</li>
                  <li>• Voluntary feedback about the tool</li>
                </ul>
              </div>
              <div>
                <p className="font-bold text-foreground text-xs uppercase tracking-widest mb-2">
                  Manual Inquiry (Contact Sales Form)
                </p>
                <ul className="space-y-1.5 text-muted-foreground">
                  <li>• Full name</li>
                  <li>• Email address</li>
                  <li>• Message content</li>
                  <li>• Subject of inquiry</li>
                </ul>
              </div>
            </div>

            <p className="mt-4">
              We do <strong>not</strong> collect payment information,
              government-issued IDs, or sensitive personal information such as
              Social Security numbers or health data.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-base font-black uppercase tracking-widest mb-4 text-foreground">
              2. How We Use Your Information
            </h2>
            <p className="mb-3">
              We use the information you provide solely for the following
              purposes:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                •{" "}
                <strong className="text-foreground">
                  To prepare your production estimate
                </strong>{" "}
                — Your event details are used to calculate and generate a
                customized quote PDF, which is emailed to you and our sales
                team.
              </li>
              <li>
                •{" "}
                <strong className="text-foreground">
                  To follow up on your inquiry
                </strong>{" "}
                — A producer may contact you to clarify details, adjust the
                estimate, or discuss your production needs.
              </li>
              <li>
                •{" "}
                <strong className="text-foreground">To send newsletters</strong>{" "}
                — Only if you explicitly opt in, we may send you production
                tips, gear updates, and company news. You can unsubscribe at any
                time.
              </li>
              <li>
                •{" "}
                <strong className="text-foreground">
                  To improve our tools
                </strong>{" "}
                — Anonymous feedback you voluntarily provide may be used to
                improve the Quote Generator.
              </li>
            </ul>
            <p className="mt-4">
              We do <strong>not</strong> sell, rent, or trade your personal
              information to any third parties for marketing purposes.
            </p>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-base font-black uppercase tracking-widest mb-4 text-foreground">
              3. How We Store Your Information
            </h2>
            <p className="mb-3">
              This Quote Generator does <strong>not</strong> store your personal
              information in any database. Here is exactly what happens with
              your data:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                • When you submit a quote, your information is processed on our
                server to generate a PDF and send two emails — one to you, one
                to our sales team.
              </li>
              <li>
                • The information lives in those emails and the attached PDF. It
                is not written to any database, log file, or persistent storage
                by our application.
              </li>
              <li>
                • Emails are delivered via{" "}
                <strong className="text-foreground">Resend</strong>, a
                third-party transactional email service. Resend may retain email
                delivery logs in accordance with their own privacy policy.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-base font-black uppercase tracking-widest mb-4 text-foreground">
              4. Third-Party Services
            </h2>
            <p className="mb-3">
              We use the following third-party services to operate this tool:
            </p>
            <div className="bg-muted/30 rounded-2xl p-6 space-y-3">
              <div>
                <p className="font-bold text-foreground text-xs uppercase tracking-widest">
                  Resend
                </p>
                <p className="text-muted-foreground text-xs mt-1">
                  Transactional email delivery. Your email address and quote
                  details are transmitted to Resend's servers for the purpose of
                  email delivery only. See{" "}
                  <a
                    href="https://resend.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-primary"
                  >
                    resend.com/privacy
                  </a>
                  .
                </p>
              </div>
              <div>
                <p className="font-bold text-foreground text-xs uppercase tracking-widest">
                  Vercel (hosting)
                </p>
                <p className="text-muted-foreground text-xs mt-1">
                  This application is hosted on Vercel. Standard server logs (IP
                  address, request timestamp) may be retained by Vercel per
                  their infrastructure policies. See{" "}
                  <a
                    href="https://vercel.com/legal/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-primary"
                  >
                    vercel.com/legal/privacy-policy
                  </a>
                  .
                </p>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-base font-black uppercase tracking-widest mb-4 text-foreground">
              5. Your Privacy Rights
            </h2>
            <p className="mb-3">
              Depending on your state of residence, you may have certain rights
              regarding your personal information. We honor the following rights
              for all users regardless of location:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                • <strong className="text-foreground">Right to know</strong> —
                You have the right to know what personal information we collect
                and how it is used. This policy fulfills that obligation.
              </li>
              <li>
                • <strong className="text-foreground">Right to access</strong> —
                You may request a copy of any personal information we hold about
                you.
              </li>
              <li>
                •{" "}
                <strong className="text-foreground">Right to correction</strong>{" "}
                — You may request correction of inaccurate information.
              </li>
              <li>
                • <strong className="text-foreground">Right to deletion</strong>{" "}
                — You may request that we delete any personal information we
                hold. Since we do not maintain a database, this primarily means
                requesting deletion from our email records.
              </li>
              <li>
                • <strong className="text-foreground">Right to opt out</strong>{" "}
                — You may opt out of newsletter communications at any time by
                contacting us directly.
              </li>
              <li>
                •{" "}
                <strong className="text-foreground">
                  Right to data portability
                </strong>{" "}
                — You may request a copy of your data in a structured, commonly
                used format.
              </li>
              <li>
                •{" "}
                <strong className="text-foreground">
                  California residents (CCPA/CPRA)
                </strong>{" "}
                — California residents have additional rights including the
                right to know whether we sell personal information (we do not)
                and the right to non-discrimination for exercising privacy
                rights.
              </li>
            </ul>
            <p className="mt-4">
              To exercise any of these rights, contact us at{" "}
              <a
                href="mailto:contact@therecordingservice.com"
                className="underline hover:text-primary font-medium"
              >
                contact@therecordingservice.com
              </a>
              .
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-base font-black uppercase tracking-widest mb-4 text-foreground">
              6. Security
            </h2>
            <p>
              We implement reasonable technical safeguards to protect your
              information during transmission, including HTTPS encryption,
              server-side input validation, and rate limiting on our API
              endpoints. However, no method of internet transmission is 100%
              secure. We encourage you to contact us immediately at{" "}
              <a
                href="mailto:harry@therecordingservice.com"
                className="underline hover:text-primary font-medium"
              >
                harry@therecordingservice.com
              </a>{" "}
              if you believe your information has been compromised.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-base font-black uppercase tracking-widest mb-4 text-foreground">
              7. Children's Privacy
            </h2>
            <p>
              This Quote Generator is intended for use by businesses and
              professionals arranging events. We do not knowingly collect
              personal information from anyone under the age of 18. If you
              believe a minor has submitted information through this form,
              please contact us and we will take appropriate steps.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-base font-black uppercase tracking-widest mb-4 text-foreground">
              8. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. When we do,
              we will update the effective date at the top of this page.
              Continued use of the Quote Generator after any changes constitutes
              your acceptance of the updated policy.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-base font-black uppercase tracking-widest mb-4 text-foreground">
              9. Contact Us
            </h2>
            <div className="bg-muted/30 rounded-2xl p-6">
              <p className="font-bold text-foreground mb-2">
                The Recording Service
              </p>
              <p className="text-muted-foreground">Atlanta, GA</p>
              <p className="text-muted-foreground">404-333-8901</p>

              <a
                href="mailto:contact@therecordingservice.com"
                className="text-primary hover:underline font-medium"
              >
                contact@therecordingservice.com
              </a>
            </div>
          </section>
        </div>

        {/* Footer nav */}
        <div className="mt-16 pt-8 border-t flex items-center justify-between text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} The Recording Service LLC</span>
          <Link
            href="/terms"
            className="hover:text-primary transition-colors font-medium"
          >
            Terms of Use →
          </Link>
        </div>
      </div>
    </main>
  );
}
