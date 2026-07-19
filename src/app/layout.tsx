import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navigation from "@/components/navigation";
import { Toaster } from "@/components/ui/sonner";
// @ts-expect-error CSS module declaration is provided by Next.js build tooling.
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Zelo",
  description:
    "Sistema de controle de vendas e estoque para pequenos negócios.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body className={`${inter.variable} antialiased`}>
        <div className="min-h-screen bg-background text-foreground">
          <Navigation />
          <main className="pb-24 md:pb-8 md:pl-64">
            <div className="mx-auto w-full max-w-5xl px-4 pt-6 md:px-8 md:pt-8">
              {children}
            </div>
          </main>
          <Toaster position="top-right" richColors />
        </div>
      </body>
    </html>
  );
}
