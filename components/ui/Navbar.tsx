import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { FileText, Layout, Zap, Menu, X } from "lucide-react";

export function Navbar() {
  const navLinks = [
    { href: "/#features", label: "Features" },
    { href: "/templates", label: "Templates" },
    { href: "/dashboard", label: "My Resumes" },
    { href: "/how-to-use", label: "How to Use" },
  ];

  return (
    <header className="fixed top-4 left-0 right-0 z-50">
      <div className="landing-container">
        <div className="w-full rounded-3xl border bg-background/80 backdrop-blur-md shadow-lg supports-backdrop-filter:bg-background/60">
          <div className="flex h-16 items-center px-4 lg:px-6">
            {/* Logo - Left */}
            <div className="flex flex-1 items-center justify-start">
              <Link href="/" className="flex items-center gap-2">
                {/* <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                  <FileText className="h-5 w-5" />
                </div> */}
                <span className="font-bold text-xl tracking-tight">
                  PrivateCV
                </span>
              </Link>
            </div>

            {/* Desktop Nav - Center */}
            <nav className="hidden md:flex items-center justify-center gap-4 lg:gap-8 text-sm font-medium mx-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-muted-foreground transition-all hover:text-primary hover:scale-105 whitespace-nowrap"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Actions - Right */}
            <div className="flex flex-1 items-center justify-end gap-2 lg:gap-4">
              <div className="hidden md:flex">
                <ThemeToggle />
              </div>
              <Link href="/templates" className="hidden md:block">
                <Button
                  size="sm"
                  className="font-semibold shadow-sm hover:shadow transition-all cursor-pointer rounded-3xl px-4"
                >
                  Get Started
                </Button>
              </Link>

              {/* Mobile Menu */}
              <div className="md:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-full"
                    >
                      <Menu className="h-5 w-5" />
                      <span className="sr-only">Toggle menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    hideClose
                    className="w-75 sm:w-87.5 px-0 border-l flex flex-col bg-background/95 backdrop-blur-md"
                  >
                    <div className="flex flex-col h-full">
                      {/* Drawer Header */}
                      <SheetHeader className="px-6 py-8 border-b text-left space-y-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col">
                              <SheetTitle className="font-bold text-xl tracking-tight leading-none text-foreground">
                                PrivateCV
                              </SheetTitle>
                              <SheetDescription className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1 font-semibold">
                                Privacy-First
                              </SheetDescription>
                            </div>
                          </div>
                          <SheetClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
                            <X className="h-5 w-5" />
                            <span className="sr-only">Close</span>
                          </SheetClose>
                        </div>
                      </SheetHeader>

                      {/* Navigation Links */}
                      <div className="flex-1 overflow-y-auto py-6 px-4">
                        <nav className="flex flex-col gap-2">
                          {navLinks.map((link) => {
                            const Icon =
                              link.label === "Features"
                                ? Layout
                                : link.label === "Templates"
                                  ? FileText
                                  : Zap;
                            return (
                              <Link
                                key={link.href}
                                href={link.href}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground group"
                              >
                                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                  <Icon className="h-4 w-4" />
                                </div>
                                {link.label}
                              </Link>
                            );
                          })}
                        </nav>

                        <div className="mt-8 px-4">
                          <Link href="/templates" className="w-full">
                            <Button
                              className="w-full font-bold h-12 text-base shadow-lg hover:shadow-xl transition-all"
                              size="lg"
                            >
                              Get Started Free
                            </Button>
                          </Link>
                        </div>
                      </div>

                      {/* Drawer Footer */}
                      <div className="mt-auto p-6 border-t bg-muted/30">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm font-medium">Theme</span>
                          <ThemeToggle />
                        </div>
                        <p className="text-xs text-muted-foreground mb-4">
                          Build your professional resume without any tracking.
                          Your data stays on your device.
                        </p>
                        <div className="flex items-center justify-between">
                          <Link
                            href="https://github.com/1arunjyoti/private-cv"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                          >
                            GitHub Repository
                          </Link>
                          <span className="text-[10px] text-muted-foreground/60">
                            v1.0.0
                          </span>
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
