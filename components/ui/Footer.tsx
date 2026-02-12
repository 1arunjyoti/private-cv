import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t py-6 bg-background">
      <div className="landing-container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-sm text-muted-foreground text-center md:text-left">
          © {new Date().getFullYear()} PrivateCV. Open Source & Privacy-First.
        </div>
        <div className="flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <Link
            href="https://github.com/1arunjyoti/private-cv"
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
  );
}
