import type { Metadata } from "next";
import localFont from "next/font/local";
import { Agentation } from "agentation";
import "./globals.css";

const namu = localFont({
  src: "./fonts/NAMU-1990.ttf",
  variable: "--font-namu",
  display: "swap",
});

const namuTitle = localFont({
  src: "./fonts/NAMU-1910.ttf",
  variable: "--font-namu-title",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Baranjske buše",
  description: "Baranjske buše — masked ritual of Croatian Baranja, chasing winter from the Danube plains",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${namu.variable} ${namuTitle.variable} antialiased`}>
        {children}
        {process.env.NODE_ENV === "development" && <Agentation />}
      </body>
    </html>
  );
}
