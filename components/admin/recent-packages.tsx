"use client";

import { TravelPackage, PackageType } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Link from "next/link";

interface RecentPackagesProps {
  packages: (TravelPackage & {
    packageType: PackageType;
  })[];
}

const getStatusBadge = (status: string) => {
  const variants: Record<
    string,
    "default" | "secondary" | "destructive" | "outline"
  > = {
    ACTIVE: "default",
    DRAFT: "secondary",
    INACTIVE: "destructive",
    UNAVAILABLE: "outline",
  };
  const labels: Record<
    string,
    "Ativo" | "Rascunho" | "Inativo" | "Indisponível"
  > = {
    ACTIVE: "Ativo",
    DRAFT: "Rascunho",
    INACTIVE: "Inativo",
    UNAVAILABLE: "Indisponível",
  };
  return <Badge variant={variants[status]}>{labels[status]}</Badge>;
};


export function RecentPackages({ packages }: RecentPackagesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pacotes Recentes</CardTitle>
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
                  <span>{format(new Date(pkg.createdAt), "d 'de' MMM 'de' yyyy")}</span>
                  <span className="mx-2">•</span>
                  <Badge variant="secondary">{pkg.packageType.name}</Badge>
                </div>
              </div>
              <div className="ml-4">
                {getStatusBadge(pkg.status)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}