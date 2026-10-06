import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Public-Ally-AI - AI Voice Partner Dashboard",
  description: "AI-powered voice assistant platform for government and citizen services",
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
