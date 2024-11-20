import { prisma } from "@/lib/prisma";
import { PackageCard } from "@/components/packages/package-card";
import { PackageFilter } from "@/components/packages/package-filter";

export default async function PackagesPage() {
  const packages = await prisma.travelPackage.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8">Travel Packages</h1>
      <PackageFilter />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {packages.map((pkg) => (
          <PackageCard key={pkg.id} package={pkg} />
        ))}
      </div>
    </div>
  );
}