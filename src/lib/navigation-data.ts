import { LayoutDashboard, Package, Plus, Receipt, Users } from "lucide-react";

type NavItem = {
  to: string;
  label: string;
  short: string;
  icon: typeof LayoutDashboard;
  primary?: boolean;
};

export const NAV: NavItem[] = [
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
