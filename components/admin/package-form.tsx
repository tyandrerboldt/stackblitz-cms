"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PackageImage, TravelPackage, PackageType } from "@prisma/client";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { ImageUpload } from "@/components/admin/image-upload";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import slugify from "slugify";

const packageSchema = z.object({
  code: z.string().min(1, "Código é obrigatório"),
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  location: z.string().min(1, "Localização é obrigatória"),
  price: z.string().min(1, "Preço é obrigatório"),
  startDate: z.string().min(1, "Data de início é obrigatória"),
  endDate: z.string().min(1, "Data de término é obrigatória"),
  maxGuests: z.string().min(1, "Máximo de hóspedes é obrigatório"),
  typeId: z.string().min(1, "Tipo de pacote é obrigatório"),
  dormitories: z.string().transform(val => parseInt(val)),
  suites: z.string().transform(val => parseInt(val)),
  bathrooms: z.string().transform(val => parseInt(val)),
  numberOfDays: z.string().transform(val => parseInt(val)),
  status: z.enum(["DRAFT", "ACTIVE", "INACTIVE", "UNAVAILABLE"]),
});

type PackageFormData = z.infer<typeof packageSchema>;

interface PackageFormProps {
  packageToEdit?: TravelPackage & { images?: PackageImage[] };
  packageTypes?: PackageType[];
}

export function PackageForm({ packageToEdit, packageTypes = [] }: PackageFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [images, setImages] = useState<{ file?: File; url: string; isMain: boolean }[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PackageFormData>({
    resolver: zodResolver(packageSchema),
    defaultValues: packageToEdit
      ? {
          ...packageToEdit,
          price: packageToEdit.price.toString(),
          startDate: new Date(packageToEdit.startDate)
            .toISOString()
            .split("T")[0],
          endDate: new Date(packageToEdit.endDate).toISOString().split("T")[0],
          maxGuests: packageToEdit.maxGuests.toString(),
          dormitories: packageToEdit.dormitories.toString(),
          suites: packageToEdit.suites.toString(),
          bathrooms: packageToEdit.bathrooms.toString(),
          numberOfDays: packageToEdit.numberOfDays.toString(),
        }
      : {
          status: "DRAFT",
          dormitories: "0",
          suites: "0",
          bathrooms: "0",
          numberOfDays: "1",
        },
  });

  const onSubmit = async (data: PackageFormData) => {
    try {
      const formData = new FormData();
      
      // Generate slug from title
      const slug = slugify(data.title, { lower: true, strict: true });
      formData.append("slug", slug);
      
      images.forEach((image, index) => {
        if (image.file) {
          formData.append(`images`, image.file);
          formData.append(`imageIsMain${index}`, image.isMain.toString());
        } else {
          formData.append(`existingImages`, image.url);
          formData.append(`existingImageIsMain${image.url}`, image.isMain.toString());
        }
      });

      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });

      const response = await fetch(
        packageToEdit ? `/api/packages/${packageToEdit.id}` : "/api/packages",
        {
          method: packageToEdit ? "PUT" : "POST",
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Falha ao salvar o pacote");

      toast({
        title: packageToEdit ? "Pacote Atualizado" : "Pacote Criado",
        description: "O pacote de viagem foi salvo com sucesso.",
      });

      router.push("/admin/packages");
      router.refresh();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao salvar o pacote de viagem.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full md:w-2/3">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Código do Pacote</Label>
              <Input id="code" {...register("code")} />
              {errors.code && (
                <p className="text-sm text-red-500">{errors.code.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                defaultValue={packageToEdit?.status || "DRAFT"}
                onValueChange={(value) => setValue("status", value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Rascunho</SelectItem>
                  <SelectItem value="ACTIVE">Ativo</SelectItem>
                  <SelectItem value="INACTIVE">Inativo</SelectItem>
                  <SelectItem value="UNAVAILABLE">Indisponível</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input id="title" {...register("title")} />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Localização</Label>
              <Input id="location" {...register("location")} />
              {errors.location && (
                <p className="text-sm text-red-500">{errors.location.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="packageType">Tipo de Pacote</Label>
            <Select
              defaultValue={packageToEdit?.typeId}
              onValueChange={(value) => setValue("typeId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um tipo de pacote" />
              </SelectTrigger>
              <SelectContent>
                {packageTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.typeId && (
              <p className="text-sm text-red-500">{errors.typeId.message}</p>
            )}
          </div>

          <ImageUpload
            existingImages={packageToEdit?.images}
            onImagesChange={setImages}
          />

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" {...register("description")} />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Preço</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                {...register("price")}
              />
              {errors.price && (
                <p className="text-sm text-red-500">{errors.price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="numberOfDays">Diárias</Label>
              <Input
                id="numberOfDays"
                type="number"
                min="1"
                {...register("numberOfDays")}
              />
              {errors.numberOfDays && (
                <p className="text-sm text-red-500">{errors.numberOfDays.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dormitories">Dormitórios</Label>
              <Input
                id="dormitories"
                type="number"
                min="0"
                {...register("dormitories")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="suites">Suítes</Label>
              <Input
                id="suites"
                type="number"
                min="0"
                {...register("suites")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bathrooms">Banheiros</Label>
              <Input
                id="bathrooms"
                type="number"
                min="0"
                {...register("bathrooms")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxGuests">Máximo de Hóspedes</Label>
              <Input
                id="maxGuests"
                type="number"
                {...register("maxGuests")}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Data de Início</Label>
              <Input
                id="startDate"
                type="date"
                {...register("startDate")}
              />
              {errors.startDate && (
                <p className="text-sm text-red-500">{errors.startDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Data de Término</Label>
              <Input
                id="endDate"
                type="date"
                {...register("endDate")}
              />
              {errors.endDate && (
                <p className="text-sm text-red-500">{errors.endDate.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/packages")}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {packageToEdit ? "Atualizar Pacote" : "Criar Pacote"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}