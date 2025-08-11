import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "../../components/ui/toast";
import Header from "../../components/ui/header";
import Footer from "../../components/ui/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://temp-mail.example.com";

export const metadata: Metadata = {
  title: "Temp Mail – Free Disposable Email",
  description:
    "Temp Mail provides free, fast, and secure disposable email addresses. Protect your privacy, avoid spam, and sign up anywhere without revealing your real email.",
  alternates: { canonical: siteUrl },
  openGraph: {
    title: "Temp Mail – Free Disposable Email",
    description:
      "Temp Mail provides free, fast, and secure disposable email addresses. Protect your privacy, avoid spam, and sign up anywhere without revealing your real email.",
    url: siteUrl,
    siteName: "Temp Mail",
    type: "website",
    images: [
      {
        url: `${siteUrl}/public/file.svg`,
        width: 1200,
        height: 630,
        alt: "Temp Mail logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Temp Mail – Free Disposable Email",
    description:
      "Temp Mail provides free, fast, and secure disposable email addresses. Protect your privacy, avoid spam, and sign up anywhere without revealing your real email.",
    site: "@tempmail",
    images: [`${siteUrl}/public/file.svg`],
  },
  other: {
    "json-ld": `{
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [{
        "@type": "Question",
        "name": "What is a disposable email?",
        "acceptedAnswer": { "@type": "Answer", "text": "A disposable email is a temporary address you can use to avoid spam and protect your privacy." }
      }]
    }`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="canonical" href={siteUrl} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: metadata.other["json-ld"] }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Header />
        <Toaster />
        {children}
        <Footer />
      </body>
    </html>
  );
}
