"use client";

import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyRound, Users, Building2 } from "lucide-react";
import Link from "next/link";

const settingsItems = [
  {
    title: "Trocar Senha",
    description: "Altere sua senha de acesso ao sistema",
    href: "/configuracoes/trocar-senha",
    icon: KeyRound,
    adminOnly: false,
  },
  {
    title: "Gerenciar Usuários",
    description: "Criar, editar e remover usuários do sistema",
    href: "/configuracoes/usuarios",
    icon: Users,
    adminOnly: true,
  },
  {
    title: "Dados da Empresa",
    description: "Configurações gerais da empresa",
    href: "/configuracoes/empresa",
    icon: Building2,
    adminOnly: true,
  },
];

export default function ConfiguracoesPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  const visibleItems = settingsItems.filter(
    (item) => !item.adminOnly || isAdmin
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Configurações" />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {visibleItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className="rounded-lg bg-primary/10 p-2">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">{item.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {item.description}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
