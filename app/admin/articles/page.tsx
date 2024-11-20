import { prisma } from "@/lib/prisma";
import { ArticleList } from "@/components/admin/article-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { PageTransition } from "@/components/page-transition";

interface SearchParams {
  page?: string;
  perPage?: string;
  search?: string;
  categoryId?: string;
  published?: string;
  sortBy?: string;
  sortOrder?: string;
}

export default async function AdminArticles({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const page = Number(searchParams.page) || 1;
  const perPage = Number(searchParams.perPage) || 5;
  const search = searchParams.search;
  const categoryId = searchParams.categoryId;
  const published = searchParams.published;
  const sortBy = searchParams.sortBy || "createdAt";
  const sortOrder = searchParams.sortOrder || "desc";

  // Build where clause
  const where: any = {};
  
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { excerpt: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (categoryId && categoryId !== "ALL") {
    where.categoryId = categoryId;
  }

  if (published && published !== "ALL") {
    where.published = published === 'true';
  }

  // Get total count for pagination
  const total = await prisma.article.count({ where });

  // Get articles with pagination and sorting
  const [articles, categories] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        category: true,
      },
    }),
    prisma.articleCategory.findMany({
      orderBy: { name: 'asc' }
    })
  ]);

  return (
    <PageTransition>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Artigos</h1>
          <Link href="/admin/articles/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Artigo
            </Button>
          </Link>
        </div>
        <ArticleList 
          articles={articles}
          categories={categories}
          currentPage={page}
          totalPages={Math.ceil(total / perPage)}
          totalItems={total}
          perPage={perPage}
        />
      </div>
    </PageTransition>
  );
}