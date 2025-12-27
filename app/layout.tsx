import type { Metadata } from "next";
import { Merriweather, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "../store/providers";
import { Header } from "@/components/ui/Header";
import { ThemeProvider } from '@/components/ThemeProvider';
import { Skiper19 } from '@/components/ui/skiper19';


// Load fonts
const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const merriweather = Merriweather({
  weight: ['300', '400', '700', '900'],
  subsets: ['latin'],
  variable: '--font-serif',
});

export const metadata: Metadata = {
  title: 'Summarix - Read any book in 10 minutes',
  description: 'Get the key insights from non-fiction bestsellers in minutes.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${merriweather.variable} ${inter.variable} font-sans antialiased bg-white text-gray-900 min-h-screen flex flex-col`}
      >
        <Providers>
          <ThemeProvider>
            <div className="flex flex-col min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans antialiased transition-colors duration-300">
              <Header />
              {children}
            </div>

            <footer className="bg-[#1F3A4B] border-t border-white/10 py-12 mt-auto">
              <div className="max-w-7xl mx-auto px-4 text-center text-[#FAFDEE] text-sm space-y-2">
                <p>
                  © {new Date().getFullYear()} Summarix. Built with Next.js, Redux & Gemini By{' '}
                  <a
                    href="https://github.com/abhayanigam"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-[#C2F84F] hover:text-white transition-colors underline decoration-1 underline-offset-2"
                  >
                    Abhaya Nigam
                  </a>
                </p>
                <p className="text-[#FAFDEE]/60 text-xs">
                  We don't own any of the books and images it belongs to its respective owners, built for educational purposes.
                </p>
              </div>
            </footer>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
