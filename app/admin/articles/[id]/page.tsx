import { prisma } from "@/lib/prisma";
import { ArticleForm } from "@/components/admin/article-form";
import { notFound } from "next/navigation";

export default async function EditArticle({
  params,
}: {
  params: { id: string };
}) {
  const article = await prisma.article.findUnique({
    where: { id: params.id },
    include: { category: true }
  });

  if (!article) {
    notFound();
  }

  const categories = await prisma.articleCategory.findMany();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Editar Artigo</h1>
      <ArticleForm articleToEdit={article} categories={categories} />
    </div>
  );
}