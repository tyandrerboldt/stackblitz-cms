"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Article, ArticleCategory } from "@prisma/client";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { RichTextEditor } from "./rich-text-editor";
import { ImagePlus, X } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const articleSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  content: z.string().min(1, "Conteúdo é obrigatório"),
  excerpt: z.string().min(1, "Resumo é obrigatório"),
  categoryId: z.string().min(1, "Categoria é obrigatória"),
  published: z.boolean().default(false),
});

type ArticleFormData = z.infer<typeof articleSchema>;

interface ArticleFormProps {
  articleToEdit?: Article;
  categories: ArticleCategory[];
}

export function ArticleForm({ articleToEdit, categories }: ArticleFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isPublished, setIsPublished] = useState(articleToEdit?.published ?? false);
  const [content, setContent] = useState(articleToEdit?.content || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(articleToEdit?.imageUrl || null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      ...articleToEdit,
      published: isPublished,
      content: content,
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    if (imagePreview && !articleToEdit?.imageUrl) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
  };

  const onSubmit = async (data: ArticleFormData) => {
    try {
      const formData = new FormData();
      
      // Adicionar imagem se existir
      if (imageFile) {
        formData.append('image', imageFile);
      } else if (imagePreview && articleToEdit?.imageUrl) {
        formData.append('existingImage', articleToEdit.imageUrl);
      } else {
        // Indica que a imagem deve ser removida
        formData.append('removeImage', 'true');
      }

      // Adicionar todos os outros dados do formulário
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });

      const response = await fetch(
        articleToEdit
          ? `/api/articles/${articleToEdit.id}`
          : "/api/articles",
        {
          method: articleToEdit ? "PUT" : "POST",
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Falha ao salvar o artigo");

      toast({
        title: articleToEdit ? "Artigo Atualizado" : "Artigo Criado",
        description: "O artigo foi salvo com sucesso.",
      });

      router.push("/admin/articles");
      router.refresh();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao salvar o artigo.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full md:w-1/2">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input id="title" {...register("title")} />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                defaultValue={articleToEdit?.categoryId}
                onValueChange={(value) => setValue("categoryId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && (
                <p className="text-sm text-red-500">{errors.categoryId.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <Label>Imagem em Destaque</Label>
            <AnimatePresence mode="wait">
              {imagePreview ? (
                <motion.div
                  key="image"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative w-full h-[300px] border rounded-lg overflow-hidden group"
                >
                  <Image
                    src={imagePreview}
                    alt="Pré-visualização da imagem em destaque"
                    fill
                    className="object-cover"
                  />
                  <motion.button
                    type="button"
                    onClick={removeImage}
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-red-500 hover:text-white transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <Label
                    htmlFor="image"
                    className="flex flex-col items-center justify-center w-full h-[300px] border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors"
                  >
                    <div className="flex flex-col items-center">
                      <ImagePlus className="h-8 w-8 text-muted-foreground" />
                      <span className="mt-2 text-sm text-muted-foreground">Carregar Imagem</span>
                    </div>
                  </Label>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Resumo</Label>
            <Input
              id="excerpt"
              {...register("excerpt")}
              placeholder="Escreva um breve resumo do artigo..."
            />
            {errors.excerpt && (
              <p className="text-sm text-red-500">{errors.excerpt.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Conteúdo</Label>
            <RichTextEditor
              content={content}
              onChange={(newContent) => {
                setContent(newContent);
                setValue("content", newContent);
              }}
            />
            {errors.content && (
              <p className="text-sm text-red-500">{errors.content.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="published"
              checked={isPublished}
              onCheckedChange={(checked) => {
                setIsPublished(checked);
                setValue("published", checked);
              }}
            />
            <Label htmlFor="published">Publicar artigo</Label>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/articles")}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {articleToEdit ? "Atualizar Artigo" : "Criar Artigo"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}