import { ArticleCategoryList } from "@/components/admin/article-category-list";
import { PageTransition } from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function AdminArticleCategories() {
  const categories = await prisma.articleCategory.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { articles: true },
      },
    },
  });

  return (
    <PageTransition>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Categorias de Artigos</h1>
          <Link href="/admin/article-categories/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Categoria
            </Button>
          </Link>
        </div>
        <ArticleCategoryList categories={categories} />
      </div>
    </PageTransition>
  );
}
