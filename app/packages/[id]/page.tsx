import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { PageTransition } from "@/components/page-transition";

export default async function PackageDetails({
  params,
}: {
  params: { id: string };
}) {
  const travelPackage = await prisma.travelPackage.findUnique({
    where: { id: params.id },
  });

  if (!travelPackage) {
    notFound();
  }

  return (
    <PageTransition>
      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="relative h-[400px] lg:h-[600px] rounded-lg overflow-hidden">
            <Image
              src={travelPackage.imageUrl}
              alt={travelPackage.title}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-4">{travelPackage.title}</h1>
            <div className="flex items-center text-muted-foreground mb-4">
              <MapPin className="h-5 w-5 mr-2" />
              <span className="text-lg">{travelPackage.location}</span>
            </div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                <span>
                  {format(new Date(travelPackage.startDate), "MMM d")} -{" "}
                  {format(new Date(travelPackage.endDate), "MMM d, yyyy")}
                </span>
              </div>
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                <span>Max {travelPackage.maxGuests} guests</span>
              </div>
            </div>
            <Separator className="my-6" />
            <div className="prose max-w-none">
              <p className="text-lg">{travelPackage.description}</p>
            </div>
            <Separator className="my-6" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Price per person</p>
                <p className="text-3xl font-bold">
                  ${travelPackage.price.toString()}
                </p>
              </div>
              <Button size="lg">Book Now</Button>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}