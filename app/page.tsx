import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import {
  FileText,
  EyeOff,
  WifiOff,
  Layout,
  Download,
  CheckCircle2,
  ArrowRight,
  Zap,
  Menu,
} from "lucide-react";

export default function Home() {
  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "/templates", label: "Templates" },
    { href: "/how-to-use", label: "How to Use" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto flex h-16 items-center px-4 md:px-6">
          {/* Logo - Left */}
          <div className="flex flex-1 items-center justify-start">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <FileText className="h-5 w-5" />
              </div>
              <span className="font-bold text-xl tracking-tight">
                PrivateCV
              </span>
            </div>
          </div>

          {/* Desktop Nav - Center */}
          <nav className="hidden md:flex flex-1 items-center justify-center gap-8 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground transition-all hover:text-primary hover:scale-105"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions - Right */}
          <div className="flex flex-1 items-center justify-end gap-4">
            <ThemeToggle />
            <Link href="/templates" className="hidden md:block">
              <Button
                size="sm"
                className="font-semibold shadow-sm hover:shadow transition-all cursor-pointer"
              >
                Get Started
              </Button>
            </Link>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-75 sm:w-100 pr-6 border-l flex flex-col"
                >
                  <SheetHeader className="text-left px-2 mb-4">
                    <SheetTitle className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <FileText className="h-4 w-4" />
                      </div>
                      <span className="font-bold text-lg tracking-tight">
                        PrivateCV
                      </span>
                    </SheetTitle>
                    <SheetDescription className="text-sm text-muted-foreground mr-4">
                      Build your professional resume without any tracking.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex-1">
                    <nav className="flex flex-col gap-6 px-2 mt-4">
                      {navLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="text-lg font-medium text-muted-foreground transition-colors hover:text-foreground hover:translate-x-1 duration-200"
                        >
                          {link.label}
                        </Link>
                      ))}
                      <div className="h-px bg-border my-4" />
                      <Link href="/templates" className="w-full">
                        <Button
                          className="w-full font-semibold h-12 text-base shadow-sm"
                          size="lg"
                        >
                          Get Started
                        </Button>
                      </Link>
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 lg:py-28 bg-linear-to-b from-background to-muted/50">
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center space-y-8 text-center">
              <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium transition-colors focus:outline-none border-transparent bg-primary/10 text-primary hover:bg-primary/20">
                <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
                v1.0 Now Available
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl max-w-4xl leading-[1.1]">
                Build Your Professional Resume{" "}
                <span className="bg-clip-text text-transparent bg-linear-to-r from-primary to-blue-600 block sm:inline">
                  Without sharing your data
                </span>
              </h1>
              <p className="mx-auto max-w-175 text-muted-foreground text-lg md:text-xl leading-relaxed">
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
                <Link href="#features" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto h-12 px-8 text-base bg-background/50 backdrop-blur-sm cursor-pointer"
                  >
                    Learn More
                  </Button>
                </Link>
              </div>
              <div className="pt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm font-medium text-muted-foreground">
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
          <div className="container mx-auto px-4 md:px-6">
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
          <div className="container mx-auto px-4 md:px-6">
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
              <div className="relative aspect-video rounded-xl bg-background shadow-2xl border p-2 rotate-2 hover:rotate-0 transition-all duration-500 ring-1 ring-border/50">
                <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent rounded-lg" />
                <div className="h-full w-full rounded border border-dashed border-muted-foreground/20 flex flex-col items-center justify-center bg-muted/5 p-8 text-center space-y-4">
                  <Layout className="h-16 w-16 text-muted-foreground/30" />
                  <div>
                    <p className="text-lg font-semibold text-foreground">
                      Interactive Preview
                    </p>
                    <p className="text-sm text-muted-foreground">
                      See your resume transform in real-time
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-muted/50">
          <div className="container mx-auto px-4 md:px-6 text-center">
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

      <footer className="border-t py-6 bg-background">
        <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-sm text-muted-foreground text-center md:text-left">
            © {new Date().getFullYear()} PrivateCV. Open Source & Privacy-First.
          </div>
          <div className="flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <Link
              href="https://github.com/1arunjyoti/resume-builder"
              className="hover:text-foreground transition-colors"
              target="_blank"
            >
              GitHub
            </Link>

            <Link
              href="/privacy"
              className="hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
          </div>
        </div>
      </footer>
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
