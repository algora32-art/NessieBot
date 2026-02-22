import "./globals.css";
import type { Metadata } from "next";

export const metadata = {
  title: "Nessie - Automatizations and Bots",
  description: "Generador inteligente de cotizaciones",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192.png",
    shortcut: "/icon-192.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <div className="relative min-h-screen">
          <div className="bg-lines absolute inset-0" />
          <div className="relative">{children}</div>
        </div>
      </body>
    </html>
  );
}
