import { prisma } from "@/lib/prisma";
import { PackageTypeList } from "@/components/admin/package-type-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { PageTransition } from "@/components/page-transition";

export default async function AdminPackageTypes() {
  const packageTypes = await prisma.packageType.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { packages: true },
      },
    },
  });

  return (
    <PageTransition>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Tipos de Pacotes</h1>
          <Link href="/admin/package-types/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Tipo
            </Button>
          </Link>
        </div>
        <PackageTypeList packageTypes={packageTypes} />
      </div>
    </PageTransition>
  );
}
