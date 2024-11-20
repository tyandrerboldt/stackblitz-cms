import { prisma } from "@/lib/prisma";
import { PackageForm } from "@/components/admin/package-form";

export default async function NewPackage() {
  const packageTypes = await prisma.packageType.findMany();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Criar Pacote</h1>
      <PackageForm packageTypes={packageTypes} />
    </div>
  );
}