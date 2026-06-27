import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ForeSee",
  description: "AI-powered deadline rescue and predictive productivity platform"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
