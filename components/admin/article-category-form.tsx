"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArticleCategory } from "@prisma/client";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";

const categorySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface ArticleCategoryFormProps {
  categoryToEdit?: ArticleCategory;
}

export function ArticleCategoryForm({ categoryToEdit }: ArticleCategoryFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: categoryToEdit,
  });

  const onSubmit = async (data: CategoryFormData) => {
    try {
      const response = await fetch(
        categoryToEdit
          ? `/api/article-categories/${categoryToEdit.id}`
          : "/api/article-categories",
        {
          method: categoryToEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) throw new Error("Falha ao salvar a categoria");

      toast({
        title: categoryToEdit ? "Categoria Atualizada" : "Categoria Criada",
        description: "A categoria do artigo foi salva com sucesso.",
      });

      router.push("/admin/article-categories");
      router.refresh();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao salvar a categoria do artigo.",
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
              onClick={() => router.push("/admin/article-categories")}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {categoryToEdit ? "Atualizar Categoria" : "Criar Categoria"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}