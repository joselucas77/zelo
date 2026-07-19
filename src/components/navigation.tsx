"use client";

import { LayoutDashboard, Package, Users, Plus, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

type NavItem = {
  to: string;
  label: string;
  short: string;
  icon: typeof LayoutDashboard;
  primary?: boolean;
};

const NAV: NavItem[] = [
  { to: "/", label: "Dashboard", short: "Início", icon: LayoutDashboard },
  { to: "/produtos", label: "Produtos", short: "Produtos", icon: Package },
  {
    to: "/nova-venda",
    label: "Nova Venda",
    short: "Vender",
    icon: Plus,
    primary: true,
  },
  { to: "/clientes", label: "Clientes", short: "Clientes", icon: Users },
  { to: "/historico", label: "Histórico", short: "Vendas", icon: Receipt },
];

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (to: string) =>
    to === "/" ? pathname === "/" : pathname.startsWith(to);

  return (
    <div className="relative">
      {/* Sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-sidebar px-4 py-6 md:flex">
        <div className="mb-8 flex items-center">
          <Image src="/zelo.png" alt="Zelo" width={64} height={64} />
          <div className="leading-tight text-md font-bold tracking-tight">
            Zelo
          </div>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV.map((n) => {
            const Icon = n.icon;
            const active = isActive(n.to);
            return (
              <Link
                key={n.to}
                href={n.to}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Bottom nav (mobile) */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/80 backdrop-blur-lg md:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-5 pb-[max(env(safe-area-inset-bottom),0.25rem)] pt-1">
          {NAV.map((n) => {
            const Icon = n.icon;
            const active = isActive(n.to);
            if (n.primary) {
              return (
                <Link
                  key={n.to}
                  href={n.to}
                  className="relative flex items-center justify-center"
                  aria-label={n.label}
                >
                  <span
                    className={cn(
                      "-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform active:scale-95",
                      active && "ring-4 ring-primary/20",
                    )}
                  >
                    <Icon className="h-6 w-6" />
                  </span>
                </Link>
              );
            }
            return (
              <Link
                key={n.to}
                href={n.to}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-1.5 text-[11px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                {n.short}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
