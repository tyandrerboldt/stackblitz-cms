import { prisma } from "@/lib/prisma";
import { PackageTypeForm } from "@/components/admin/package-type-form";
import { notFound } from "next/navigation";

export default async function EditPackageType({
  params,
}: {
  params: { id: string };
}) {
  const packageType = await prisma.packageType.findUnique({
    where: { id: params.id },
  });

  if (!packageType) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Editar Tipo de Pacote</h1>
      <PackageTypeForm packageTypeToEdit={packageType} />
    </div>
  );
}