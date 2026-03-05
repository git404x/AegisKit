import { ThemeProvider } from "@/components/ui/ThemeProvider";
import ThemePicker from "@/components/ui/ThemePicker";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "AegisKit",
  description: "Secure. Local. Modular. A privacy-first web toolkit.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThemeProvider>
          {children}
          <ThemePicker />
        </ThemeProvider>
      </body>
    </html>
  );
}
