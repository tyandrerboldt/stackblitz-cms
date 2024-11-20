import { prisma } from "@/lib/prisma";
import { ArticleCategoryForm } from "@/components/admin/article-category-form";
import { notFound } from "next/navigation";

export default async function EditArticleCategory({
  params,
}: {
  params: { id: string };
}) {
  const category = await prisma.articleCategory.findUnique({
    where: { id: params.id },
  });

  if (!category) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Editar Categoria</h1>
      <ArticleCategoryForm categoryToEdit={category} />
    </div>
  );
}