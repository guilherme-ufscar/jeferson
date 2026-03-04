"use client";

import { PageHeader } from "@/components/layout/page-header";
import { VehicleForm } from "@/components/forms/vehicle-form";

export default function NovoVeiculoPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Novo Veículo" />
      <VehicleForm />
    </div>
  );
}
