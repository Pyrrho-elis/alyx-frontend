import localFont from "next/font/local";
import "./globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import Navbar from "./components/Nav";

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
};

export default function RootLayout({ children }) {
  // const pathname = window.location.pathname;
  // const isDashboard = pathname.startsWith("/dashboard");
  return (
    <html className="scroll-smooth" lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-custom-gradient`}
      >
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
