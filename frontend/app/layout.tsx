import type { Metadata } from "next";
import Navbar from "../components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "CityPulse AI — Your city. Your voice. Your impact.",
  description:
    "AI-powered platform to report, understand, track and improve urban issues in Hyderabad. CityFix Buildathon (Tutedude).",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:bg-white focus:p-2">
          Skip to main content
        </a>
        <Navbar />
        <main id="main" className="mx-auto max-w-6xl px-4 py-6">
          {children}
        </main>
        <footer className="border-t bg-white px-4 py-6 text-center text-sm text-gray-600">
                    CityPulse AI — CityFix Buildathon (Tutedude), Hyderabad. No
          government affiliation is claimed.
        </footer>
      </body>
    </html>
  );
}
