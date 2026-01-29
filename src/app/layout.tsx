import type { Metadata } from "next";
import { Anton, Inter } from "next/font/google";
import "./globals.css";

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Galacticos Vele Blu - Official Website",
  description: "Sito ufficiale dei Galacticos Vele Blu",
  metadataBase: new URL("https://galacticosvb.it"),
  icons: {
    icon: "/assets/logo.webp",
  },
  openGraph: {
    type: "website",
    url: "https://galacticosvb.it/",
    title: "Galacticos Vele Blu - Official Website",
    description: "Sito ufficiale dei Galacticos Vele Blu",
    images: [
      {
        url: "/assets/thumbnail.jpg",
        width: 1200,
        height: 630,
        alt: "Galacticos Vele Blu",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Galacticos Vele Blu - Official Website",
    description: "Sito ufficiale dei Galacticos Vele Blu",
    images: ["/assets/thumbnail.jpg"],
  },
};

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body
        className={`${anton.variable} ${inter.variable} antialiased flex flex-col min-h-screen`}
      >
        <Providers>
            <Navbar />
            <main className="flex-grow">
            {children}
            </main>
            <Footer />
        </Providers>
      </body>
    </html>
  );
}
