import { prisma } from "@/lib/prisma";
import { PackageForm } from "@/components/admin/package-form";
import { notFound } from "next/navigation";

export default async function EditPackage({
  params,
}: {
  params: { id: string };
}) {
  const [packageData, packageTypes] = await Promise.all([
    prisma.travelPackage.findUnique({
      where: { id: params.id },
      include: { images: true }
    }),
    prisma.packageType.findMany()
  ]);

  if (!packageData) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Editar Pacote</h1>
      <PackageForm packageToEdit={packageData} packageTypes={packageTypes} />
    </div>
  );
}