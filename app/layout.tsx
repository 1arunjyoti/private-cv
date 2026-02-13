import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClientProviders } from "@/components/ClientProviders";
import { AnalyticsNotice } from "@/components/AnalyticsNotice";
import { ClarityAnalytics } from "@/components/ClarityAnalytics";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://privatecv.vercel.app"),
  title: {
    default: "PrivateCV - Privacy-First Resume Creator",
    template: "%s | PrivateCV",
  },
  description:
    "Build professional resumes offline with complete privacy. No data leaves your device. Free, open-source, and ATS-friendly.",
  keywords: [
    "resume builder",
    "cv builder",
    "resume maker",
    "cv maker",
    "offline resume builder",
    "privacy first",
    "privacy focused",
    "offline resume",
    "ats friendly",
    "cv maker",
    "open source resume",
    "no tracking",
    "local resume builder",
  ],
  authors: [{ name: "PrivateCV Team" }],
  creator: "PrivateCV",
  publisher: "PrivateCV",
  verification: {
    google: "TIysdvlHq9kPCYBFo2vXMN_mFZ_zmOpMCBPGcOfXJXw",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://privatecv.vercel.app",
    title: "PrivateCV - Build Your Resume Privately",
    description:
      "The only resume builder that respects your privacy. No sign-up, no servers, works offline.",
    siteName: "PrivateCV",
    // images: [
    //   {
    //     url: "/og-image.jpg", // We should probably add an OG image later if not present
    //     width: 1200,
    //     height: 630,
    //     alt: "PrivateCV Preview",
    //   },
    // ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PrivateCV - Privacy-First Resume Creator",
    description:
      "Build professional resumes offline with complete privacy. No data leaves your device.",
    // images: ["/og-image.jpg"],
    creator: "@1arunjyoti", // Assuming from github username, can be changed
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PrivateCV",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#3b82f6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClientProviders>{children}</ClientProviders>
        <AnalyticsNotice />
        <ClarityAnalytics />
      </body>
    </html>
  );
}
