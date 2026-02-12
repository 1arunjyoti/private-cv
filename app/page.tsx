import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle2,
  Download,
  EyeOff,
  Layout,
  WifiOff,
  Zap,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "PrivateCV",
    url: "https://privatecv.vercel.app",
    image: "https://privatecv.vercel.app/opengraph-image",
    operatingSystem: "Web Browser",
    applicationCategory: "BusinessApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "A privacy-first, offline-capable resume builder that runs entirely in your browser. No data leaves your device.",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "120",
    },
    featureList:
      "Offline mode, ATS-friendly templates, PDF export, Privacy focused, No sign-up required",
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Header */}
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-28 pb-16 md:pt-32 md:pb-24 lg:pt-36 lg:pb-28 bg-linear-to-b from-background to-muted/50">
          <div className="landing-container mx-auto px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center space-y-8 text-center">
              <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium transition-colors focus:outline-none border-transparent bg-primary/10 text-primary hover:bg-primary/20">
                <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
                v1.0 Now Available
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl max-w-5xl leading-[1.1]">
                Build Your Professional Resume{" "}
                <span className="bg-clip-text text-transparent bg-linear-to-r from-primary to-blue-600 block sm:inline">
                  Without sharing your data
                </span>
              </h1>
              <p className="mx-auto max-w-2xl text-muted-foreground text-lg md:text-xl leading-relaxed">
                A privacy-first resume builder that runs entirely in your
                browser. No servers, no data storing, no tracking, just you and
                your data. Offline capable.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto pt-4">
                <Link href="/templates" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto h-12 px-8 text-base shadow-lg hover:shadow-xl transition-all cursor-pointer"
                  >
                    Start Building Now <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/how-to-use" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto h-12 px-8 text-base bg-background/50 backdrop-blur-sm cursor-pointer"
                  >
                    Learn More
                  </Button>
                </Link>
              </div>
              <div className="pt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm font-medium text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Free Forever</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>No Sign-up</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>ATS Friendly</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 bg-background">
          <div className="landing-container mx-auto px-4 md:px-6">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Everything You Need
              </h2>
              <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
                Powerful features designed to help you land your dream job, all
                while respecting your privacy.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 ">
              <FeatureCard
                icon={<EyeOff className="h-8 w-8 text-primary" />}
                title="Anonymous Analytics"
                description="We use anonymous page view tracking to improve the app. Your resume content and personal data remain 100% private and offline."
              />
              <FeatureCard
                icon={<WifiOff className="h-8 w-8 text-primary" />}
                title="Works Offline"
                description="Full PWA support means you can build and edit your resume even without an internet connection."
              />
              <FeatureCard
                icon={<Layout className="h-8 w-8 text-primary" />}
                title="ATS-Proof Templates"
                description="Clean, professional templates designed to pass Applicant Tracking Systems with ease."
              />
              <FeatureCard
                icon={<Zap className="h-8 w-8 text-primary" />}
                title="Instant Preview"
                description="See changes in real-time as you type. No loading spinners or server delays."
              />
              <FeatureCard
                icon={<CheckCircle2 className="h-8 w-8 text-primary" />}
                title="Job Matcher"
                description="Paste a job description to see how well your resume keywords match the requirements."
              />
              <FeatureCard
                icon={<Download className="h-8 w-8 text-primary" />}
                title="Easy Export"
                description="Download as PDF or export your raw JSON data for backup and portability."
              />
            </div>
          </div>
        </section>

        {/* Templates Teaser */}
        <section id="templates" className="py-24 bg-muted/30">
          <div className="landing-container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                    Professional Templates
                  </h2>
                  <p className="text-muted-foreground text-lg md:text-xl">
                    Choose between our ATS-optimized scanner template for
                    maximum compatibility, or our Creative template for a modern
                    look that stands out.
                  </p>
                </div>
                <ul className="space-y-6">
                  <TemplateFeature
                    number="1"
                    title="ATS Scanner"
                    description="Proven single-column layout parsers love."
                  />
                  <TemplateFeature
                    number="2"
                    title="Creative Sidebar"
                    description="Two-column layout with skill visualization."
                  />
                  <TemplateFeature
                    number="3"
                    title="Customizable"
                    description="Adjust theme colors to match your personal brand."
                  />
                </ul>
                <div className="pt-4">
                  <Link href="/templates">
                    <Button
                      size="lg"
                      className="h-12 px-8 text-base cursor-pointer"
                    >
                      Choose Template
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative aspect-video rounded-2xl bg-muted/20 shadow-2xl border p-3 group/mock hover:scale-[1.02] transition-all duration-500 overflow-hidden ring-1 ring-border/50">
                <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />

                <div className="flex h-full gap-3 overflow-hidden rounded-xl border bg-background shadow-sm relative">
                  {/* Left Sidebar Mock */}
                  <div className="w-14 shrink-0 border-r bg-muted/30 flex flex-col items-center py-4 gap-4">
                    <div className="h-2 w-8 rounded-full bg-primary/20" />
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                          i === 1
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground/30"
                        }`}
                      >
                        <div className="h-3 w-3 bg-current rounded-xs opacity-50" />
                      </div>
                    ))}
                    <div className="mt-auto h-8 w-8 rounded-full bg-muted/50" />
                  </div>

                  {/* Editor Side Mock */}
                  <div className="w-1/3 shrink-0 border-r p-4 space-y-4 bg-muted/5">
                    <div className="space-y-2">
                      <div className="h-2 w-12 bg-muted-foreground/20 rounded-full" />
                      <div className="h-8 w-full bg-background border rounded-lg" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 w-16 bg-muted-foreground/20 rounded-full" />
                      <div className="h-20 w-full bg-background border rounded-lg" />
                    </div>
                    <div className="space-y-2 pt-2">
                      <div className="h-2 w-full bg-muted-foreground/10 rounded-full" />
                      <div className="h-2 w-2/3 bg-muted-foreground/10 rounded-full" />
                    </div>
                  </div>

                  {/* Preview Container Mock */}
                  <div className="flex-1 bg-muted/40 p-6 flex flex-col items-center overflow-hidden">
                    {/* Floating Toolbar */}
                    <div className="mb-4 h-8 px-3 rounded-full bg-background border shadow-sm flex items-center gap-3">
                      <div className="h-2 w-8 bg-muted-foreground/20 rounded-full" />
                      <div className="h-3 w-px bg-border" />
                      <div className="flex gap-1.5 font-sans">
                        <div className="h-3 w-3 bg-muted-foreground/20 rounded-full" />
                        <div className="h-3 w-3 bg-muted-foreground/20 rounded-full" />
                      </div>
                    </div>

                    {/* Resume Document Mock */}
                    <div className="w-full h-[150%] bg-background rounded-sm shadow-xl border p-8 space-y-6 transform origin-top translate-y-2 group-hover/mock:translate-y-0 transition-transform duration-700">
                      {/* Header */}
                      <div className="space-y-3">
                        <div className="h-6 w-32 bg-foreground/10 rounded-xs" />
                        <div className="h-2 w-48 bg-muted-foreground/20 rounded-full" />
                        <div className="flex gap-3">
                          <div className="h-2 w-16 bg-primary/20 rounded-full" />
                          <div className="h-2 w-20 bg-muted-foreground/10 rounded-full" />
                        </div>
                      </div>

                      <div className="h-px bg-border" />

                      {/* Content Blocks */}
                      <div className="space-y-5">
                        <div className="space-y-2">
                          <div className="h-3 w-24 bg-foreground/10 rounded-xs" />
                          <div className="space-y-1.5">
                            <div className="h-2 w-full bg-muted-foreground/5 rounded-full" />
                            <div className="h-2 w-[90%] bg-muted-foreground/5 rounded-full" />
                            <div className="h-2 w-[95%] bg-muted-foreground/5 rounded-full" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="h-3 w-28 bg-foreground/10 rounded-xs" />
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <div className="h-2 w-full bg-muted-foreground/5 rounded-full" />
                              <div className="h-2 w-5/6 bg-muted-foreground/5 rounded-full" />
                            </div>
                            <div className="space-y-2">
                              <div className="h-2 w-full bg-muted-foreground/5 rounded-full" />
                              <div className="h-2 w-4/6 bg-muted-foreground/5 rounded-full" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-background/5 opacity-0 group-hover/mock:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <div className="px-4 py-2 rounded-full bg-foreground text-background text-xs font-bold shadow-2xl scale-90 group-hover/mock:scale-100 transition-transform">
                      Live Editing Mode
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-muted/50">
          <div className="landing-container mx-auto px-4 md:px-6 text-center">
            <div className="max-w-3xl mx-auto space-y-8">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Ready to Build Your Resume?
              </h2>
              <p className="text-muted-foreground/90 text-lg md:text-2xl leading-relaxed">
                Join thousands of privacy-conscious professionals.{" "}
                <br className="hidden sm:inline" />
                No account required. Open source. Free forever.
              </p>
              <div className="pt-4">
                <Link href="/templates">
                  <Button
                    size="lg"
                    variant="default"
                    className="h-14 px-10 text-lg shadow-xl hover:shadow-2xl transition-all cursor-pointer"
                  >
                    Create My Resume
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group flex flex-col items-center text-center p-8 bg-card rounded-2xl border shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
      <div
        className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors"
        aria-hidden="true"
      >
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function TemplateFeature({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <li className="flex items-start gap-4">
      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-sm font-bold text-primary">{number}</span>
      </div>
      <div>
        <span className="font-semibold text-foreground block mb-1">
          {title}
        </span>
        <span className="text-muted-foreground">{description}</span>
      </div>
    </li>
  );
}
