"use client";

import { TravelPackage, PackageType } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface TrendingPackagesProps {
  packages: (TravelPackage & {
    packageType: PackageType;
  })[];
}

export function TrendingPackages({ packages }: TrendingPackagesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pacotes em Alta</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {packages.map((pkg) => (
            <div key={pkg.id} className="flex items-center">
              <div className="space-y-1 flex-1">
                <Link 
                  href={`/admin/packages/${pkg.id}`}
                  className="font-medium hover:underline"
                >
                  {pkg.title}
                </Link>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Badge variant="secondary">{pkg.packageType.name}</Badge>
                  <span className="mx-2">•</span>
                  <span>R${pkg.price.toLocaleString()}</span>
                </div>
              </div>
              <div className="ml-4">
                <Badge variant="default" className="bg-green-500">
                  {pkg.contactCount} contatos
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}