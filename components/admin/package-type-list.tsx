"use client";

import { PackageType } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface PackageTypeListProps {
  packageTypes: (PackageType & {
    _count: {
      packages: number;
    };
  })[];
}

export function PackageTypeList({ packageTypes }: PackageTypeListProps) {
  const router = useRouter();
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/package-types/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Falha ao deletar o tipo de pacote");

      toast({
        title: "Tipo de Pacote Deletado",
        description: "O tipo de pacote foi deletado com sucesso.",
      });
      
      router.refresh();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao deletar o tipo de pacote.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="rounded-md border bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Pacotes</TableHead>
            <TableHead>Criado</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {packageTypes.map((type) => (
            <TableRow key={type.id}>
              <TableCell className="font-medium">{type.name}</TableCell>
              <TableCell>{type.description}</TableCell>
              <TableCell>{type._count.packages}</TableCell>
              <TableCell>{format(new Date(type.createdAt), "d 'de' MMM 'de' yyyy")}</TableCell>
              <TableCell>
                <div className="flex justify-end space-x-2">
                  <Link href={`/admin/package-types/${type.id}`}>
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
                        <AlertDialogTitle>Deletar Tipo de Pacote</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza de que deseja deletar este tipo de pacote? Isso também afetará todos os pacotes associados a este tipo.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(type.id)}>
                          Deletar
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
  );
}