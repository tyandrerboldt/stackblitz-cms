"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { PackageType, TravelPackage } from "@prisma/client";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { ArrowUpDown, Edit, Search, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

interface PackageListProps {
  packages: (TravelPackage & {
    packageType: PackageType;
  })[];
  packageTypes: PackageType[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  perPage: number;
}

const PAGE_SIZE_OPTIONS = [5, 10, 20, 30];

export function PackageList({
  packages,
  packageTypes,
  currentPage,
  totalPages,
  totalItems,
  perPage,
}: PackageListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [typeId, setTypeId] = useState(searchParams.get("typeId") || "");
  const [sortBy, setSortBy] = useState(
    searchParams.get("sortBy") || "createdAt"
  );
  const [sortOrder, setSortOrder] = useState(
    searchParams.get("sortOrder") || "desc"
  );
  const [pageSize, setPageSize] = useState(perPage);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/packages/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete package");

      toast({
        title: "Pacote Excluído",
        description: "O pacote foi excluído com sucesso.",
      });

      router.refresh();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao excluir o pacote.",
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

    router.push(`/admin/packages?${newSearchParams.toString()}`);
  };

  const handleSort = (column: string) => {
    const newSortOrder =
      sortBy === column && sortOrder === "asc" ? "desc" : "asc";
    setSortBy(column);
    setSortOrder(newSortOrder);
    updateSearchParams({ sortBy: column, sortOrder: newSortOrder });
  };

  const handleSearch = () => {
    updateSearchParams({
      search,
      status,
      typeId,
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
    setStatus("");
    setTypeId("");
    setSortBy("createdAt");
    setSortOrder("desc");
    router.push("/admin/packages");
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      ACTIVE: "default",
      DRAFT: "secondary",
      INACTIVE: "destructive",
      UNAVAILABLE: "outline",
    };
    const labels: Record<
      string,
      "Ativo" | "Rascunho" | "Inativo" | "Indisponível"
    > = {
      ACTIVE: "Ativo",
      DRAFT: "Rascunho",
      INACTIVE: "Inativo",
      UNAVAILABLE: "Indisponível",
    };
    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };


  const hasActiveFilters = search || status || typeId;

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row gap-4 bg-background p-4 rounded-lg border"
      >
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar pacotes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
        </div>

        <div className="w-full md:w-48">
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value);
              updateSearchParams({ status: value, page: "1" });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              <SelectItem value="ACTIVE">Ativo</SelectItem>
              <SelectItem value="DRAFT">Rascunho</SelectItem>
              <SelectItem value="INACTIVE">Inativo</SelectItem>
              <SelectItem value="UNAVAILABLE">Indisponível</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-48">
          <Select
            value={typeId}
            onValueChange={(value) => {
              setTypeId(value);
              updateSearchParams({ typeId: value, page: "1" });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tipo de Pacote" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              {packageTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
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
      </motion.div>

      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("code")}
              >
                Código
                <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("title")}
              >
                Título
                <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("location")}
              >
                Localização
                <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("price")}
              >
                Preço
                <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("startDate")}
              >
                Data Início
                <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {packages.map((pkg) => (
              <TableRow key={pkg.id}>
                <TableCell className="font-medium">{pkg.code}</TableCell>
                <TableCell>{pkg.title}</TableCell>
                <TableCell>{pkg.location}</TableCell>
                <TableCell>R$ {pkg.price.toFixed(2)}</TableCell>
                <TableCell>{getStatusBadge(pkg.status)}</TableCell>
                <TableCell>{pkg.packageType.name}</TableCell>
                <TableCell>
                  {format(new Date(pkg.startDate), "dd/MM/yyyy")}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end space-x-2">
                    <Link href={`/admin/packages/${pkg.id}`}>
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
                          <AlertDialogTitle>Excluir Pacote</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir este pacote? Esta
                            ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(pkg.id)}
                          >
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
