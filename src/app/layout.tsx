import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Resume Screener — Know your fit score before you apply",
  description:
    "A hybrid local + AI resume screener. Upload a resume, paste a job description, and get an evidence-backed fit score with keyword extraction, bias checks, PDF reports, and bulk recruiter ranking.",
};

const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem('theme');
    var light;
    if (stored === 'light') light = true;
    else if (stored === 'dark') light = false;
    else light = !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches);
    document.documentElement.classList.toggle('light', light);
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetBrainsMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}