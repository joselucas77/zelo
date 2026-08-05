"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ModeToggle({ className }: { className?: string }) {
  const { setTheme, resolvedTheme } = useTheme();

  // Usamos o resolvedTheme para garantir que funcione mesmo se o usuário
  // estiver com a opção "Sistema" selecionada no tema.
  const isDark = resolvedTheme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className={cn("relative overflow-hidden", className)}
    >
      <Sun
        className={`h-[1.2rem] w-[1.2rem] transition-all duration-500 ease-in-out ${
          isDark
            ? "scale-0 rotate-90 translate-y-4 opacity-0" // Sai: encolhe, gira, desce e some
            : "scale-100 rotate-0 translate-y-0 opacity-100" // Entra: tamanho normal, volta ao centro
        }`}
      />
      <Moon
        className={`absolute h-[1.2rem] w-[1.2rem] transition-all duration-500 ease-in-out ${
          isDark
            ? "scale-100 rotate-0 translate-y-0 opacity-100" // Entra: tamanho normal, centraliza
            : "scale-0 -rotate-90 -translate-y-4 opacity-0" // Sai: encolhe, gira no sentido inverso, sobe e some
        }`}
      />

      <span className="sr-only">Alternar tema</span>
    </Button>
  );
}
