import { Icon } from "@iconify/react";
import type { Metadata } from "next";
import "./globals.css";
import { VoiceProvider } from "@/context/VoiceContext";
import VoiceSidebar from "@/components/voice/VoiceSidebar";
import IdlePrompt from "@/components/voice/IdlePrompt";

export const metadata: Metadata = {
  title: "Sahaay | Modern Grievance Platform",
  description: "A simplified portal to report issues, track resolutions, and help maintain community standards.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js" async></script>
        <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyD1hUYxjmaZTauEfYlZ3i9dXFWUfGxQk0E&libraries=places" async defer></script>
      </head>
      <body>
        <VoiceProvider>
          {children}
          <VoiceSidebar />
          <IdlePrompt />
        </VoiceProvider>
      </body>
    </html>
  );
}
