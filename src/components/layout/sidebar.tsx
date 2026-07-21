"use client";

import {
  LayoutDashboard,
  Package,
  Users,
  Plus,
  Receipt,
  ChevronDown,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useSidebar } from "@/components/ui/sidebar";

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

export default function AppSidebar() {
  const { open } = useSidebar();

  const pathname = usePathname();

  const isActive = (to: string) =>
    to === "/" ? pathname === "/" : pathname.startsWith(to);

  return (
    <Sidebar
      variant="sidebar"
      collapsible="icon"
      className="hidden h-screen w-64 border-r md:flex"
    >
      {/* Cabeçalho com o Logo */}
      <SidebarHeader>
        {/* <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Image src="/zelo.png" alt="Zelo" width={20} height={20} />
          </div>
          {open && (
            <span className="text-lg font-bold tracking-tight">Zelo</span>
          )}
        </div> */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              Select Workspace
              <ChevronDown className="ml-auto" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Conteúdo da Navegação */}
      <SidebarContent>
        <SidebarMenu>
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to);

            return (
              <SidebarMenuItem key={item.to}>
                <SidebarMenuButton
                  render={
                    <Link href={item.to}>
                      <Icon />
                      <span>{item.label}</span>
                    </Link>
                  }
                  isActive={active}
                ></SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
