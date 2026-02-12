import Link from "next/link";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import {
  ShieldCheck,
  Lock,
  Database,
  EyeOff,
  CloudOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header */}
      <Navbar />

      <main className="flex-1">
        {/* Title Section */}
        <section className="pt-28 pb-16 md:pt-32 md:pb-24 bg-linear-to-b from-background to-muted/50">
          <div className="landing-container mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-2">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                Privacy is Our Foundation
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                We believe your personal data belongs to you. That&apos;s why
                we&apos;ve built this tool to run entirely in your browser.
              </p>
            </div>
          </div>
        </section>

        {/* Core Pillars */}
        <section className="py-20 bg-background">
          <div className="landing-container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
              <PrivacyAspect
                icon={<Database className="h-8 w-8 text-primary" />}
                title="Browser-Based Storage"
                description="Your resumes, photos, and personal details are stored inside your browser's IndexedDB. We never transfer this data to any external server."
              />
              <PrivacyAspect
                icon={<CloudOff className="h-8 w-8 text-primary" />}
                title="100% Offline Capable"
                description="Because everything runs on your device, you can use the builder without an internet connection. Your data never leaves your 'local network' of one."
              />
              <PrivacyAspect
                icon={<EyeOff className="h-8 w-8 text-primary" />}
                title="Anonymous Analytics"
                description="We use Vercel Analytics to understand website traffic and performance to improve the app. This data is completely anonymous and does NOT include any personal information from your resume."
              />
              <PrivacyAspect
                icon={<Lock className="h-8 w-8 text-primary" />}
                title="Zero Account Policy"
                description="We don't have a sign-up form because we don't need your email. Your session is tied to your browser, not a centralized database."
              />
            </div>
          </div>
        </section>

        {/* Detailed FAQ Section */}
        <section className="py-20 bg-muted/30 border-t">
          <div className="landing-container mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto space-y-12">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold">
                  Frequently Asked Questions
                </h2>
                <p className="text-muted-foreground text-lg">
                  Transparency is key to trust. Here is exactly how we handle
                  technical aspects of your privacy.
                </p>
              </div>

              <div className="space-y-8">
                <FAQItem
                  question="Where exactly is my data saved?"
                  answer="Your data is saved in a persistent database built into your browser called IndexedDB. This is private storage that only this website can access on your specific device. If you clear your browser's site data or 'cookies and site data' for this domain, your resumes will be deleted."
                />
                <FAQItem
                  question="How do I backup my data?"
                  answer="Since we don't store your data, we recommend using the 'Export JSON' feature in the editor. This downloads a local file to your computer that you can re-import later if you switch devices or browsers."
                />
                <FAQItem
                  question="Is it open source?"
                  answer="Yes. One of the best ways to ensure privacy is transparency. Our code is available for anyone to audit and verify that no hidden tracking or data exfiltration exists."
                />
                <FAQItem
                  question="What about the PDF generation?"
                  answer="The PDF is generated using @react-pdf/renderer, which runs in your browser's JavaScript engine. Your resume data is converted to a PDF document entirely on your CPU, without hitting a remote rendering server."
                />
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 border-t">
          <div className="landing-container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-2xl font-bold mb-6">Ready to create?</h2>
            <Link href="/templates">
              <Button
                size="lg"
                className="h-12 px-8 font-semibold cursor-pointer"
              >
                Start Building Now
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function PrivacyAspect({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-5">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
        {icon}
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold">{question}</h3>
      <p className="text-muted-foreground leading-relaxed">{answer}</p>
    </div>
  );
}
