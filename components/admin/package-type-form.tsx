"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PackageType } from "@prisma/client";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";

const packageTypeSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
});

type PackageTypeFormData = z.infer<typeof packageTypeSchema>;

interface PackageTypeFormProps {
  packageTypeToEdit?: PackageType;
}

export function PackageTypeForm({ packageTypeToEdit }: PackageTypeFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PackageTypeFormData>({
    resolver: zodResolver(packageTypeSchema),
    defaultValues: packageTypeToEdit,
  });

  const onSubmit = async (data: PackageTypeFormData) => {
    try {
      const response = await fetch(
        packageTypeToEdit
          ? `/api/package-types/${packageTypeToEdit.id}`
          : "/api/package-types",
        {
          method: packageTypeToEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) throw new Error("Falha ao salvar o tipo de pacote");

      toast({
        title: packageTypeToEdit ? "Tipo de Pacote Atualizado" : "Tipo de Pacote Criado",
        description: "O tipo de pacote foi salvo com sucesso.",
      });

      router.push("/admin/package-types");
      router.refresh();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao salvar o tipo de pacote.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full md:w-1/3">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" {...register("description")} />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/package-types")}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {packageTypeToEdit ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}