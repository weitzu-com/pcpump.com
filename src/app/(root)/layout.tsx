import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.pcpump.com"),
  title: "PCPUMP",
  description: "Oilfield production, drilling, intervention and tubular equipment for global projects.",
  openGraph: { images: [{ url: "https://www.pcpump.com/opengraph-image", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", images: ["https://www.pcpump.com/opengraph-image"] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
