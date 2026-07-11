import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ChatProvider } from "@/lib/chat-context";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { MicrosoftClarity } from "@/components/MicrosoftClarity";
import { AnalyticsProvider } from "@/lib/analytics";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const googleSiteVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Ravencrest Academy | Personalized Learning with Expert Tutors",
    template: "%s | Ravencrest Academy",
  },
  description: "Connect with expert tutors and achieve your academic goals with Ravencrest Academy. Learn from verified educators in one-on-one sessions tailored to your needs.",
  keywords: ["online tutoring", "tutors", "education", "e-learning", "academic help", "homework help", "math tutors", "science tutors", "language tutors"],
  authors: [{ name: "Ravencrest Academy" }],
  creator: "Ravencrest Academy",
  publisher: "Ravencrest Academy",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: appUrl,
    siteName: "Ravencrest Academy",
    title: "Ravencrest Academy | Personalized Learning with Expert Tutors",
    description: "Connect with expert tutors and achieve your academic goals with Ravencrest Academy.",
    images: [
      {
        url: `${appUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Ravencrest Academy - Personalized Learning",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ravencrest Academy | Personalized Learning with Expert Tutors",
    description: "Connect with expert tutors and achieve your academic goals with Ravencrest Academy.",
    images: [`${appUrl}/og-image.jpg`],
    creator: "@ravencrestademy",
  },
  verification: googleSiteVerification ? {
    google: googleSiteVerification,
  } : undefined,
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased scroll-smooth`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              name: "Ravencrest Academy",
              description: "Connect with expert tutors and achieve your academic goals with Ravencrest Academy.",
              url: appUrl,
              potentialAction: {
                "@type": "SearchAction",
                target: `${appUrl}/tutors?q={search_term_string}`,
                "query-input": "required name=search_term_string"
              },
              sameAs: [
                "https://www.facebook.com/ravencrestademy",
                "https://www.twitter.com/ravencrestademy",
                "https://www.linkedin.com/school/ravencrestademy"
              ]
            })
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-off-white font-sans text-dark-navy">
        <ClerkProvider afterSignOutUrl="/">
          <ChatProvider>
            <GoogleAnalytics />
            <MicrosoftClarity />
            <AnalyticsProvider />
            <Navbar />
            <main className="flex-grow pt-20">
              {children}
            </main>
            <Footer />
          </ChatProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
