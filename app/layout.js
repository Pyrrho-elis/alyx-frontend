import localFont from "next/font/local";
import "./globals.css";
import Navbar from "./components/Nav";
import FadeUp from "./components/FadeUp";

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
  return (
    <html className="scroll-smooth" lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <FadeUp yPos={"-100px"}>
          <Navbar />
        </FadeUp>
        {children}
      </body>
    </html>
  );
}
