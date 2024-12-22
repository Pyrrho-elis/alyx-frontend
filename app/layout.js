import localFont from "next/font/local";
import "./globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import Navbar from "./components/Nav";
import { Analytics } from "@vercel/analytics/react"

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "Subzz",
  description: "Monetize Your Telegram Community",
  metadataBase: new URL('https://subzz.app'),
  openGraph: {
    title: 'Subzz',
    description: 'Monetize Your Telegram Community',
    url: 'https://subzz.app',
    siteName: 'Subzz',
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta httpEquiv="Content-Security-Policy" content="
          default-src * data: blob: 'unsafe-inline' 'unsafe-eval';
          script-src * data: blob: 'unsafe-inline' 'unsafe-eval';
          connect-src * 'unsafe-inline';
          img-src * data: blob: 'unsafe-inline';
          frame-src *;
          style-src * data: blob: 'unsafe-inline';
          font-src * data:;
          media-src *;
        " />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-custom-gradient`}
      >
        <Analytics/>
        {/* <div className="bg-custom-gradient"> */}
        <Navbar />
        <SidebarProvider>
          {/* <div className="w-full"> */}
          {children}
          {/* </div> */}
        </SidebarProvider>
        {/* </div> */}
      </body>
    </html>
  );
}
