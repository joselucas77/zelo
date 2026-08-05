"use client";

import { SettingsIcon, LogOutIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SettingsItens } from "@/lib/navigation-data";
import { ModeToggle } from "./mode-toggle";
import Link from "next/link";

export default function SettingsItem() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline">
            <SettingsIcon />
          </Button>
        }
      />
      <DropdownMenuContent>
        <DropdownMenuItem className="focus:bg-transparent">
          <ModeToggle className="w-full" />
        </DropdownMenuItem>
        {SettingsItens.map((item) => (
          <DropdownMenuItem
            key={item.to}
            render={
              <Link href={item.to} className="flex items-center gap-2">
                <item.icon />
                {item.label}
              </Link>
            }
          ></DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <Link href="/logout" className="flex items-center gap-2">
            <LogOutIcon />
            Sair
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
