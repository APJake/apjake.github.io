import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import { person } from "@/lib/content";
import Grain from "@/components/Grain";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["800"],
  variable: "--font-display",
  display: "swap",
});

const body = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-body",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://apjake.github.io"),
  title: `${person.name} — ${person.role}`,
  description:
    "Android engineer with four years full time and freelance work since 2019. The apps I have worked on have passed two million downloads on Google Play.",
  openGraph: {
    title: `${person.name} — ${person.role}`,
    description: "Android engineer who builds useful things. Kotlin, Compose, Flutter.",
    url: "https://apjake.github.io",
    siteName: person.wordmark,
    type: "profile",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0c",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        {children}
        <Grain />
      </body>
    </html>
  );
}
