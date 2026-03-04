"use client";

import { PageHeader } from "@/components/layout/page-header";
import { ClientForm } from "@/components/forms/client-form";

export default function NovoClientePage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Novo Cliente" />
      <ClientForm />
    </div>
  );
}
