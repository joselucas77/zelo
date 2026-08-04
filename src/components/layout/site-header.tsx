"use client";

import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NAV, SECONDARY_NAV } from "@/lib/navigation-data";
import { ModeToggle } from "./mode-toggle";
import { useIsMobile } from "@/hooks/use-mobile";
import { Settings } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";

export function SiteHeader() {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  // Função auxiliar para não repetir a lógica de verificação de rota
  const matchRoute = (item: { to: string }) =>
    item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);

  // Procura na navegação principal. Se não achar (undefined), procura na secundária.
  const currentRoute = NAV.find(matchRoute) || SECONDARY_NAV.find(matchRoute);

  // Se achar em qualquer um dos dois, usa o label. Senão, usa "Página".
  const pageTitle = currentRoute?.label || "Página";

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <div className="hidden items-center gap-2 md:flex">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
        </div>
        <h1 className="text-base font-medium">{pageTitle}</h1>
        <div className="ml-auto flex items-center gap-2">
          {isMobile ? (
            <Button
              variant="outline"
              size="icon"
              className="relative overflow-hidden"
              render={
                <Link href="/configuracoes">
                  <Settings className="h-[1.2rem] w-[1.2rem]" />
                  <span className="sr-only">Configurações</span>
                </Link>
              }
            />
          ) : (
            <ModeToggle />
          )}
        </div>
      </div>
    </header>
  );
}
