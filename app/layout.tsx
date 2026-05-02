import type { Metadata } from "next";
import "./globals.css";
import { BioSignalProvider } from "@/lib/BioSignalContext";

export const metadata: Metadata = {
  title: "MindCanvas — Biofeedback Art Studio",
  description: "Turn your brain and heart signals into live generative art. Powered by the Elata Biosignal SDK.",
  keywords: ["biofeedback", "EEG", "rPPG", "generative art", "NFT", "meditation"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <BioSignalProvider>
          {children}
        </BioSignalProvider>
      </body>
    </html>
  );
}
