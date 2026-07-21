import type { Metadata } from "next";
import { Inter } from "next/font/google";
// import Navigation from "@/components/navigation";
import { Toaster } from "@/components/ui/sonner";
// @ts-expect-error CSS module declaration is provided by Next.js build tooling.
import "./globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
// import AppSidebar from "@/components/layout/sidebar";

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
        <SidebarProvider
          style={
            {
              "--sidebar-width": "calc(var(--spacing) * 42)",
              "--header-height": "calc(var(--spacing) * 12)",
            } as React.CSSProperties
          }
        >
          <AppSidebar variant="inset" />
          {children}
          <Toaster position="top-right" richColors />
        </SidebarProvider>
        {/* <div className="min-h-screen bg-background text-foreground">
          <SidebarProvider>
            <AppSidebar />
            <Navigation />
            <main className="w-full min-w-md px-4 pt-6 md:px-8 md:pt-8">
              {children}
            </main>
            <Toaster position="top-right" richColors />
          </SidebarProvider>
        </div> */}
      </body>
    </html>
  );
}
