"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Car,
  Users,
  FileText,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Wrench,
  AlertTriangle,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
  children?: { label: string; href: string }[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Veículos", href: "/veiculos", icon: Car },
  { label: "Clientes", href: "/clientes", icon: Users },
  { label: "Contratos", href: "/contratos", icon: FileText },
  { label: "Cobranças", href: "/cobrancas", icon: CreditCard },
  { label: "Receitas", href: "/receitas", icon: TrendingUp },
  { label: "Despesas", href: "/despesas", icon: TrendingDown },
  { label: "Manutenção", href: "/manutencao", icon: Wrench },
  { label: "Multas", href: "/multas", icon: AlertTriangle },
  {
    label: "Relatórios",
    href: "/relatorios",
    icon: BarChart3,
    children: [
      { label: "Lucro por Veículo", href: "/relatorios/lucro-por-veiculo" },
      { label: "Lucro Geral", href: "/relatorios/lucro-geral" },
    ],
  },
  { label: "Configurações", href: "/configuracoes", icon: Settings, adminOnly: true },
];

interface SidebarProps {
  userRole?: string;
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["/relatorios"]);

  const toggleGroup = (href: string) => {
    setExpandedGroups((prev) =>
      prev.includes(href) ? prev.filter((h) => h !== href) : [...prev, href]
    );
  };

  const filteredItems = navItems.filter(
    (item) => !item.adminOnly || userRole === "ADMIN"
  );

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-zinc-200 bg-white transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center justify-between border-b border-zinc-200 px-4">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <Car className="h-6 w-6 text-zinc-900" />
            <span className="text-lg font-bold text-zinc-900">LocaFácil</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              pathname.startsWith(item.href + "/");
            const isExpanded = expandedGroups.includes(item.href);

            if (item.children) {
              return (
                <li key={item.href}>
                  <button
                    onClick={() => toggleGroup(item.href)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-zinc-100 text-zinc-900"
                        : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        <ChevronRight
                          className={cn(
                            "h-4 w-4 transition-transform",
                            isExpanded && "rotate-90"
                          )}
                        />
                      </>
                    )}
                  </button>
                  {!collapsed && isExpanded && (
                    <ul className="ml-8 mt-1 space-y-1">
                      {item.children.map((child) => {
                        const isChildActive = pathname === child.href;
                        return (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className={cn(
                                "block rounded-lg px-3 py-1.5 text-sm transition-colors",
                                isChildActive
                                  ? "bg-zinc-100 font-medium text-zinc-900"
                                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                              )}
                            >
                              {child.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            }

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-zinc-100 text-zinc-900"
                      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      {!collapsed && (
        <>
          <Separator />
          <div className="p-4">
            <p className="text-xs text-zinc-400">LocaFácil v1.0</p>
          </div>
        </>
      )}
    </aside>
  );
}
