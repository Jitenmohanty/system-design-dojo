import type { Metadata } from "next";
import { Chakra_Petch, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

const chakra = Chakra_Petch({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-chakra",
  display: "swap",
});
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "System Design Dojo — Learn System Design Interactively",
    template: "%s · System Design Dojo",
  },
  description:
    "From 'What is a server?' to 'Design YouTube' — learn system design with live simulations, animated diagrams, memes, and zero boring slides.",
  keywords: [
    "system design", "interview prep", "load balancing", "caching",
    "distributed systems", "microservices", "scalability",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${chakra.variable} ${spaceGrotesk.variable} ${jetbrains.variable} antialiased`}
      >
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
