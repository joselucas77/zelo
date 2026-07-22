"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { NAV } from "@/lib/navigation-data";
import { Handbag } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  const isActive = (to: string) =>
    to === "/" ? pathname === "/" : pathname.startsWith(to);
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="mb-6">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="data-[slot=sidebar-menu-button]:p-1.5!">
              <Handbag className="size-5! text-blue-700 dark:text-blue-600" />
              <span className="text-base font-bold text-blue-700 dark:text-blue-600">
                ZELO
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map((item) => {
                const active = isActive(item.to);
                return (
                  <SidebarMenuItem className="pb-1" key={item.to}>
                    <SidebarMenuButton
                      tooltip={item.label}
                      render={
                        <Link href={item.to}>
                          {<item.icon />}
                          <span>{item.label}</span>
                        </Link>
                      }
                      className={
                        active ? "bg-primary text-primary-foreground" : ""
                      }
                    ></SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
