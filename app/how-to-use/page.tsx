import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import {
  FileText,
  Layout,
  PenLine,
  Palette,
  Download,
  ArrowRight,
  FileJson,
  Save,
  Target,
  Briefcase,
  Wand2,
  RotateCcw,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function HowToUsePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60">
        <div className="landing-container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex flex-1 items-center justify-start">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md transition-transform hover:scale-110">
                <FileText className="h-5 w-5" />
              </div>
              <span className="font-bold text-xl tracking-tight">
                PrivateCV
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Home
            </Link>
            <Link
              href="/templates"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Templates
            </Link>
          </nav>

          <div className="flex flex-1 items-center justify-end gap-4">
            <ThemeToggle />
            <Link href="/templates">
              <Button
                size="sm"
                className="shadow-sm font-semibold cursor-pointer"
              >
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden py-20 md:py-28 bg-linear-to-b from-background to-muted/50">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--color-primary),transparent_25%)] opacity-5" />
          <div className="landing-container mx-auto px-4 md:px-6 relative z-10 text-center">
            <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium border-primary/20 bg-primary/10 text-primary mb-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
              <Sparkles className="h-3.5 w-3.5 mr-2" />
              Mastering PrivateCV
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl mb-6 max-w-4xl mx-auto leading-[1.1]">
              Build Your Perfect Resume{" "}
              <span className="bg-clip-text text-transparent bg-linear-to-r from-primary to-blue-600">
                Step by Step
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
              Everything you need to know about creating, customizing, and
              exporting your professional resume with absolute privacy.
            </p>
          </div>
        </section>

        {/* Steps */}
        <section className="py-24 relative overflow-hidden">
          <div className="landing-container mx-auto px-4 md:px-6 relative z-10">
            <div className="space-y-32">
              {/* Step 1 */}
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold text-xl shadow-lg shadow-primary/20">
                      1
                    </div>
                    <div className="h-px flex-1 bg-linear-to-r from-border to-transparent" />
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                      Choose Your Template
                    </h2>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      Start your journey by selecting a design that matches your
                      professional identity. Our templates are crafted for
                      different industries and experience levels.
                    </p>
                    <ul className="space-y-3 pt-2">
                      {[
                        "ATS-Optimized designs for max compatibility",
                        "Creative layouts for visual impact",
                        "Modern minimalist styles for a sleek look",
                      ].map((item, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-3 text-sm font-medium"
                        >
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="relative group">
                  <div className="absolute -inset-4 bg-linear-to-br from-primary/10 to-transparent rounded-3xl blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000" />
                  <div className="relative aspect-video rounded-2xl bg-muted/20 border p-3 shadow-2xl overflow-hidden backdrop-blur-sm">
                    <div className="flex h-full gap-3 overflow-hidden rounded-xl border bg-background shadow-sm relative">
                      <div className="flex-1 p-6 grid grid-cols-2 gap-3">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={cn(
                              "rounded-lg border bg-muted/5 p-3 flex flex-col gap-2 transition-all duration-300",
                              i === 1
                                ? "ring-2 ring-primary bg-primary/5 border-primary/20"
                                : "grayscale opacity-50",
                            )}
                          >
                            <div className="h-2 w-12 bg-muted-foreground/20 rounded-full" />
                            <div className="flex-1 space-y-1">
                              <div className="h-1 w-full bg-muted-foreground/10 rounded-full" />
                              <div className="h-1 w-3/4 bg-muted-foreground/10 rounded-full" />
                            </div>
                            <div className="h-4 w-full bg-primary/10 rounded-md" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                <div className="lg:order-last space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold text-xl shadow-lg shadow-primary/20">
                      2
                    </div>
                    <div className="h-px flex-1 bg-linear-to-r from-border to-transparent" />
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                      Fill in Your Details
                    </h2>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      Enter your information through our intuitive tabbed
                      editor. We&apos;ve organized everything from basic contact
                      info to specialized sections like publications and awards.
                    </p>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 pt-2">
                      {[
                        "Basics",
                        "Experience",
                        "Education",
                        "Skills",
                        "Projects",
                        "More...",
                      ].map((tab, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-sm font-medium text-muted-foreground"
                        >
                          <div className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                          {tab}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="relative group">
                  <div className="absolute -inset-4 bg-linear-to-br from-blue-500/10 to-transparent rounded-3xl blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000" />
                  <div className="relative aspect-video rounded-2xl bg-muted/20 border p-3 shadow-2xl overflow-hidden backdrop-blur-sm">
                    <div className="flex h-full gap-3 overflow-hidden rounded-xl border bg-background shadow-sm relative">
                      <div className="w-16 border-r bg-muted/30 flex flex-col p-2 gap-2 shrink-0">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className={cn(
                              "h-6 w-full rounded-md",
                              i === 2 ? "bg-primary/20" : "bg-muted",
                            )}
                          />
                        ))}
                      </div>
                      <div className="flex-1 p-6 space-y-4">
                        <div className="h-2 w-24 bg-muted-foreground/20 rounded-full" />
                        <div className="space-y-2">
                          <div className="h-8 w-full bg-muted/50 border rounded-lg" />
                          <div className="h-8 w-full bg-muted/50 border rounded-lg" />
                        </div>
                        <div className="h-16 w-full bg-muted/50 border rounded-lg" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold text-xl shadow-lg shadow-primary/20">
                      3
                    </div>
                    <div className="h-px flex-1 bg-linear-to-r from-border to-transparent" />
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                      Customize Your Style
                    </h2>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      Make it yours by adjusting colors, typography, and layout
                      settings. See your changes in real-time as you refine your
                      resume&apos;s aesthetic.
                    </p>
                    <div className="flex gap-3 pt-2">
                      {[
                        "h-8 w-8 rounded-full bg-blue-500 ring-2 ring-offset-2 ring-blue-500",
                        "h-8 w-8 rounded-full bg-emerald-500",
                        "h-8 w-8 rounded-full bg-orange-500",
                        "h-8 w-8 rounded-full bg-slate-900 dark:bg-slate-100",
                      ].map((cls, i) => (
                        <div key={i} className={cls} />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="relative group">
                  <div className="absolute -inset-4 bg-linear-to-br from-purple-500/10 to-transparent rounded-3xl blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000" />
                  <div className="relative aspect-video rounded-2xl bg-muted/20 border p-3 shadow-2xl overflow-hidden backdrop-blur-sm">
                    <div className="flex h-full gap-3 overflow-hidden rounded-xl border bg-background shadow-sm relative">
                      <div className="flex-1 p-6 flex flex-col gap-6">
                        <div className="space-y-3">
                          <div className="h-2 w-20 bg-muted-foreground/20 rounded-full" />
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <div
                                key={i}
                                className={cn(
                                  "h-6 w-6 rounded-full",
                                  i === 1
                                    ? "ring-2 ring-primary ring-offset-1"
                                    : "",
                                )}
                                style={{
                                  backgroundColor:
                                    i === 1
                                      ? "var(--color-primary)"
                                      : `hsl(${i * 60}, 70%, 50%)`,
                                }}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="h-2 w-24 bg-muted-foreground/20 rounded-full" />
                          <div className="grid grid-cols-2 gap-2">
                            <div className="h-10 rounded border bg-muted/10 p-2 flex items-center justify-center font-serif text-sm">
                              Serif
                            </div>
                            <div className="h-10 rounded border bg-primary/5 ring-1 ring-primary/20 p-2 flex items-center justify-center font-sans text-sm font-bold">
                              Sans
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="w-1/3 bg-muted/10 border-l p-4 flex flex-col gap-2 shrink-0">
                        <div className="h-32 w-full bg-background border shadow-sm rounded-sm p-4 space-y-2">
                          <div className="h-1.5 w-12 bg-primary/20 rounded-full" />
                          <div className="h-1 w-full bg-muted-foreground/10 rounded-full" />
                          <div className="h-1 w-5/6 bg-muted-foreground/10 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                <div className="lg:order-last space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold text-xl shadow-lg shadow-primary/20">
                      4
                    </div>
                    <div className="h-px flex-1 bg-linear-to-r from-border to-transparent" />
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                      Save & Export
                    </h2>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      Download your high-quality PDF ready for applications.
                      Don&apos;t forget to export your JSON backup to keep your
                      data safe and portable across devices.
                    </p>
                    <div className="flex flex-col gap-2 pt-2">
                      <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/5">
                        <Download className="h-4 w-4 text-primary" />
                        <span className="text-sm font-semibold">
                          Download PDF
                        </span>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/5">
                        <FileJson className="h-4 w-4 text-primary" />
                        <span className="text-sm font-semibold">
                          Backup as JSON
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="relative group">
                  <div className="absolute -inset-4 bg-linear-to-br from-emerald-500/10 to-transparent rounded-3xl blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000" />
                  <div className="relative aspect-video rounded-2xl bg-muted/20 border p-3 shadow-2xl overflow-hidden backdrop-blur-sm">
                    <div className="flex h-full items-center justify-center bg-background rounded-xl relative">
                      <div className="relative h-32 w-24 bg-background border shadow-xl rounded-sm p-4 flex flex-col items-center justify-center gap-2 group-hover:scale-110 transition-transform duration-500">
                        <div className="absolute top-0 right-0 bg-primary/10 px-1.5 py-0.5 text-[8px] font-bold text-primary rounded-bl-lg">
                          PDF
                        </div>
                        <CheckCircle2 className="h-8 w-8 text-green-500" />
                        <div className="h-1.5 w-12 bg-muted-foreground/20 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy Alert */}
            <div className="mt-32 max-w-3xl mx-auto">
              <div className="relative group">
                <div className="absolute -inset-1 bg-linear-to-r from-primary to-blue-600 rounded-2xl blur opacity-10 group-hover:opacity-25 transition duration-500" />
                <div className="relative p-6 md:p-8 bg-card border rounded-2xl flex flex-col md:flex-row gap-6 items-start shadow-sm">
                  <div className="shrink-0 h-14 w-14 flex items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Save className="h-7 w-7" />
                  </div>
                  <div className="space-y-3 flex-1">
                    <h3 className="text-xl font-bold">Safety & Persistence</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Your progress is automatically saved to your
                      browser&apos;s local storage. However, for total peace of
                      mind, we strongly recommend{" "}
                      <strong>Exporting your JSON</strong> and keeping it safe.
                      This ensures you can restore your data even if you clear
                      your browser history.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Smart Tools Grid */}
        <section className="py-24 bg-muted/30 relative overflow-hidden text-center lg:text-left">
          <div className="landing-container mx-auto px-4 md:px-6 relative z-10">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Powerful Built-in Tools
              </h2>
              <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
                Go beyond simple text editing with integrated features that help
                you land the interview.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <ToolCard
                icon={<Target className="h-6 w-6" />}
                title="Real-Time ATS Score"
                description="Our analyzer checks your content against common ATS criteria instantly. Aim for 70+ to increase your visibility to recruiters."
                color="green"
              />
              <ToolCard
                icon={<Briefcase className="h-6 w-6" />}
                title="Keyword Matcher"
                description="Paste a job description to see missing keywords. We compare your resume against the requirements in real-time."
                color="blue"
              />
              <ToolCard
                icon={<Wand2 className="h-6 w-6" />}
                title="One-Click Sample Data"
                description="Instantly see how a template looks with professional dummy data. A great way to visualize your end result before starting."
                color="purple"
              />
              <ToolCard
                icon={<RotateCcw className="h-6 w-6" />}
                title="Complete Data Ownership"
                description="Easily reset all data with a single click. You are in full control of your local database at all times."
                color="red"
              />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 relative overflow-hidden bg-muted/50">
          <div className="landing-container mx-auto px-4 text-center space-y-8">
            <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
              Ready to start building?
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
              Create your professional resume today with the privacy you
              deserve. No sign-up required.
            </p>
            <div className="flex items-center justify-center pt-4">
              <Link href="/templates">
                <Button
                  size="lg"
                  className="h-14 px-10 text-lg shadow-xl hover:shadow-2xl transition-all font-bold cursor-pointer"
                >
                  Create My Resume Now <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 bg-background">
        <div className="landing-container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-sm text-muted-foreground text-center md:text-left">
            © {new Date().getFullYear()} PrivateCV. Open Source & Privacy-First.
          </div>
          <div className="flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
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

function ToolCard({
  icon,
  title,
  description,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: "green" | "blue" | "purple" | "red";
}) {
  const colorMap = {
    green:
      "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 border-emerald-200 dark:border-emerald-800/30 shadow-emerald-500/5",
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 border-blue-200 dark:border-blue-800/30 shadow-blue-500/5",
    purple:
      "bg-purple-100 dark:bg-purple-900/30 text-purple-600 border-purple-200 dark:border-purple-800/30 shadow-purple-500/5",
    red: "bg-red-100 dark:bg-red-900/30 text-red-600 border-red-200 dark:border-red-800/30 shadow-red-500/5",
  };

  return (
    <div className="group relative">
      <div
        className={cn(
          "absolute -inset-0.5 rounded-2xl blur opacity-0 group-hover:opacity-15 transition duration-500",
          color === "green"
            ? "bg-emerald-500"
            : color === "blue"
              ? "bg-blue-500"
              : color === "purple"
                ? "bg-purple-500"
                : "bg-red-500",
        )}
      />
      <div className="relative bg-card border rounded-2xl p-8 flex flex-col gap-6 h-full transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg">
        <div
          className={cn(
            "h-12 w-12 flex items-center justify-center rounded-xl border",
            colorMap[color],
          )}
        >
          {icon}
        </div>
        <div className="space-y-2 text-left">
          <h3 className="text-xl font-bold">{title}</h3>
          <p className="text-muted-foreground leading-relaxed">{description}</p>
        </div>
        <div className="mt-auto pt-4 flex">
          <div
            className={cn(
              "h-1 w-12 rounded-full",
              color === "green"
                ? "bg-emerald-500/30"
                : color === "blue"
                  ? "bg-blue-500/30"
                  : color === "purple"
                    ? "bg-purple-500/30"
                    : "bg-red-500/30",
            )}
          />
        </div>
      </div>
    </div>
  );
}
