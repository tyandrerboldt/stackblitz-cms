import { PackageTypeForm } from "@/components/admin/package-type-form";

export default function NewPackageType() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Criar Tipo de Pacote</h1>
      <PackageTypeForm />
    </div>
  );
}