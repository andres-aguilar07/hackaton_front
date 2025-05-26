import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Hackaton 2025",
  description: "Hackaton 2025",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <nav className="flex justify-center py-6 px-4 bg-gray-50 shadow-sm">
          <div className="flex gap-6 max-sm:flex-col max-sm:w-full max-sm:max-w-xs">
            <Link href="/head-nurse/Home">
              <button className="px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-md font-medium text-sm transition-all hover:bg-gray-50 hover:-translate-y-px hover:shadow-sm active:translate-y-0">
                Head Nurse
              </button>
            </Link>
            <Link href="/Pharmacy/Home">
              <button className="px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-md font-medium text-sm transition-all hover:bg-gray-50 hover:-translate-y-px hover:shadow-sm active:translate-y-0">
                Pharmacy
              </button>
            </Link>
            <Link href="/instrumentator/Home">
              <button className="px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-md font-medium text-sm transition-all hover:bg-gray-50 hover:-translate-y-px hover:shadow-sm active:translate-y-0">
                Instrumentator
              </button>
            </Link>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
