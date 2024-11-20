"use client";

import { Article, ArticleCategory } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Link from "next/link";

interface RecentArticlesProps {
  articles: (Article & {
    category: ArticleCategory;
  })[];
}

export function RecentArticles({ articles }: RecentArticlesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Artigos Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {articles.map((article) => (
            <div key={article.id} className="flex items-center">
              <div className="space-y-1 flex-1">
                <Link 
                  href={`/admin/articles/${article.id}`}
                  className="font-medium hover:underline"
                >
                  {article.title}
                </Link>
                <div className="flex items-center text-sm text-muted-foreground">
                  <span>{format(new Date(article.createdAt), "d 'de' MMM 'de' yyyy")}</span>
                  <span className="mx-2">•</span>
                  <Badge variant="secondary">{article.category.name}</Badge>
                </div>
              </div>
              <div className="ml-4">
                <Badge variant={article.published ? "default" : "secondary"}>
                  {article.published ? "Publicado" : "Rascunho"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}