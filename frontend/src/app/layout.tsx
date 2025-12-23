import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LokMitra AI - Responsive AI Dashboard",
  description: "AI-powered dashboard for government and corporate entities",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {children}
      </body>
    </html>
  );
}
