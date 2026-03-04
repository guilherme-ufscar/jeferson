"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { ClientForm } from "@/components/forms/client-form";

export default function EditarClientePage() {
  const { id } = useParams();
  const [client, setClient] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/clientes/${id}`)
      .then((r) => r.json())
      .then(setClient)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="space-y-6"><PageHeader title="Editar Cliente" /><div className="h-40 animate-pulse rounded bg-muted" /></div>;
  if (!client) return <div className="space-y-6"><PageHeader title="Cliente não encontrado" /></div>;

  return (
    <div className="space-y-6">
      <PageHeader title={`Editar ${client.name}`} />
      <ClientForm initialData={client} isEditing />
    </div>
  );
}
