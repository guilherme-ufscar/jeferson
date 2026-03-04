"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { VehicleForm } from "@/components/forms/vehicle-form";

export default function EditarVeiculoPage() {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/veiculos/${id}`)
      .then((r) => r.json())
      .then(setVehicle)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Editar Veículo" />
        <div className="h-40 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="space-y-6">
        <PageHeader title="Veículo não encontrado" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={`Editar ${vehicle.placa}`} />
      <VehicleForm initialData={vehicle} isEditing />
    </div>
  );
}
