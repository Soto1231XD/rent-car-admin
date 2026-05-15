import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rentamivar Admin",
  description: "Sistema interno para la administración de renta de carros.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
