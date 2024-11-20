"use client";

import { Article, ArticleCategory } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye, Search, X, ArrowUpDown } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface ArticleListProps {
  articles: (Article & {
    category: ArticleCategory;
  })[];
  categories: ArticleCategory[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  perPage: number;
}

const PAGE_SIZE_OPTIONS = [5, 10, 20, 30];

export function ArticleList({ 
  articles, 
  categories,
  currentPage,
  totalPages,
  totalItems,
  perPage,
}: ArticleListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [categoryId, setCategoryId] = useState(searchParams.get("categoryId") || "");
  const [published, setPublished] = useState(searchParams.get("published") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "createdAt");
  const [sortOrder, setSortOrder] = useState(searchParams.get("sortOrder") || "desc");
  const [pageSize, setPageSize] = useState(perPage);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/articles/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete article");

      toast({
        title: "Artigo Excluído",
        description: "O artigo foi excluído com sucesso.",
      });
      
      router.refresh();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao excluir o artigo.",
        variant: "destructive",
      });
    }
  };

  const updateSearchParams = (params: Record<string, string>) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());

    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newSearchParams.set(key, value);
      } else {
        newSearchParams.delete(key);
      }
    });

    router.push(`/admin/articles?${newSearchParams.toString()}`);
  };

  const handleSort = (column: string) => {
    const newSortOrder = sortBy === column && sortOrder === "asc" ? "desc" : "asc";
    setSortBy(column);
    setSortOrder(newSortOrder);
    updateSearchParams({ sortBy: column, sortOrder: newSortOrder });
  };

  const handleSearch = () => {
    updateSearchParams({
      search,
      categoryId,
      published,
      page: "1", // Reset to first page on new search
    });
  };

  const handlePageChange = (page: number) => {
    updateSearchParams({ page: page.toString() });
  };

  const handlePageSizeChange = (size: string) => {
    setPageSize(Number(size));
    updateSearchParams({
      perPage: size,
      page: "1", // Reset to first page when changing page size
    });
  };

  const clearFilters = () => {
    setSearch("");
    setCategoryId("");
    setPublished("");
    setSortBy("createdAt");
    setSortOrder("desc");
    router.push("/admin/articles");
  };

  const hasActiveFilters = search || categoryId || published;

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 bg-background p-4 rounded-lg border">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar artigos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
        </div>

        <div className="w-full md:w-48">
          <Select
            value={published}
            onValueChange={(value) => {
              setPublished(value);
              updateSearchParams({ published: value, page: "1" });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              <SelectItem value="true">Publicado</SelectItem>
              <SelectItem value="false">Rascunho</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-48">
          <Select
            value={categoryId}
            onValueChange={(value) => {
              setCategoryId(value);
              updateSearchParams({ categoryId: value, page: "1" });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSearch}>Filtrar</Button>
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              Limpar
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("title")}
              >
                Título
                <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Status</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("createdAt")}
              >
                Criado em
                <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles.map((article) => (
              <TableRow key={article.id}>
                <TableCell className="font-medium">{article.title}</TableCell>
                <TableCell>{article.category.name}</TableCell>
                <TableCell>
                  <Badge variant={article.published ? "default" : "secondary"}>
                    {article.published ? "Publicado" : "Rascunho"}
                  </Badge>
                </TableCell>
                <TableCell>{format(new Date(article.createdAt), "dd/MM/yyyy")}</TableCell>
                <TableCell>
                  <div className="flex justify-end space-x-2">
                    <Link href={`/blog/${article.slug}`} target="_blank">
                      <Button variant="outline" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/admin/articles/${article.id}`}>
                      <Button variant="outline" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir Artigo</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir este artigo? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(article.id)}>
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-4">
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            Mostrando {(currentPage - 1) * perPage + 1} até{" "}
            {Math.min(currentPage * perPage, totalItems)} de {totalItems}{" "}
            resultados
          </p>

          <Select
            value={pageSize.toString()}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger className="w-[110px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size} itens
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
          
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={() =>
                  currentPage > 1 && handlePageChange(currentPage - 1)
                }
              />
            </PaginationItem>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  href="#"
                  isActive={page === currentPage}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={() =>
                  currentPage < totalPages && handlePageChange(currentPage + 1)
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}