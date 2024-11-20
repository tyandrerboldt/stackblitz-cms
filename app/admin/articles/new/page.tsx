import { prisma } from "@/lib/prisma";
import { ArticleForm } from "@/components/admin/article-form";

export default async function NewArticle() {
  const categories = await prisma.articleCategory.findMany();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Criar Artigo</h1>
      <ArticleForm categories={categories} />
    </div>
  );
}