"use client";

import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

interface BreadcrumbItem {
  label: string;
  href: string;
}

const translations: Record<string, string> = {
  // Páginas principais
  "admin": "Painel",
  "packages": "Pacotes",
  "articles": "Artigos",
  "users": "Usuários",
  "settings": "Configurações",
  
  // Subpáginas
  "new": "Novo",
  "edit": "Editar",
  "package-types": "Tipos de Pacote",
  "article-categories": "Categorias de Artigo",
  
  // Estados
  "draft": "Rascunho",
  "active": "Ativo",
  "inactive": "Inativo",
};

function translatePathSegment(segment: string): string {
  // Primeiro, verifica se existe uma tradução direta
  if (translations[segment.toLowerCase()]) {
    return translations[segment.toLowerCase()];
  }

  // Se não houver tradução, formata o texto
  return segment
    .split('-')
    .map(word => {
      const translation = translations[word.toLowerCase()];
      if (translation) return translation;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const paths = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];
  let currentPath = '';

  paths.forEach((path) => {
    currentPath += `/${path}`;
    const label = translatePathSegment(path);

    breadcrumbs.push({
      label,
      href: currentPath,
    });
  });

  return breadcrumbs;
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const breadcrumbs = generateBreadcrumbs(pathname);

  return (
    <motion.nav 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center space-x-2 text-sm text-muted-foreground mb-6"
    >
      <Link 
        href="/admin" 
        className="flex items-center hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {breadcrumbs.map((breadcrumb, index) => (
        <motion.div
          key={breadcrumb.href}
          className="flex items-center"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <ChevronRight className="h-4 w-4 mx-2" />
          <Link
            href={breadcrumb.href}
            className={`hover:text-foreground transition-colors ${
              index === breadcrumbs.length - 1 ? 'text-foreground font-medium' : ''
            }`}
          >
            {breadcrumb.label}
          </Link>
        </motion.div>
      ))}
    </motion.nav>
  );
}