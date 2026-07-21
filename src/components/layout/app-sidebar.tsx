"use client";

import { NavMain } from "@/components/layout/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Package, Plus, Receipt, Users } from "lucide-react";
import Image from "next/image";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: LayoutDashboard,
    },
    {
      title: "Produtos",
      url: "/produtos",
      icon: Package,
    },
    {
      title: "Nova Venda",
      url: "/nova-venda",
      icon: Plus,
    },
    {
      title: "Clientes",
      url: "/clientes",
      icon: Users,
    },
    {
      title: "Histórico",
      url: "/historico",
      icon: Receipt,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { open } = useSidebar();
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="mb-6">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Image
                src="/zelo.png"
                alt="Zelo"
                className="h-16 w-16 pt-2 object-contain shrink-0"
                width={64}
                height={64}
              />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="text-base font-semibold">Zelo</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
    </Sidebar>
  );
}
