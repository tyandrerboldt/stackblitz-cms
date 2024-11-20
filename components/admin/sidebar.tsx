"use client";

import { cn } from "@/lib/utils";
import { LayoutDashboard, Package, Users, LogOut, BookOpen, Tags, FileText, FolderTree, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose?: () => void;
  isMobile: boolean;
}

interface SiteSettings {
  name: string;
  logo: string | null;
}

const menuItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Pacotes",
    href: "/admin/packages",
    icon: Package,
  },
  {
    title: "Artigos",
    href: "/admin/articles",
    icon: FileText,
  },
  {
    title: "Tipos de Pacotes",
    href: "/admin/package-types",
    icon: Tags,
  },
  {
    title: "Categorias de Artigos",
    href: "/admin/article-categories",
    icon: FolderTree,
  },
  {
    title: "Usuários",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Configurações",
    href: "/admin/settings",
    icon: Settings,
  },
];

const SidebarContent = ({ pathname, settings }: { pathname: string; settings: SiteSettings | null }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="flex flex-col h-full"
  >
    <div className="h-16 border-b flex items-center px-6">
      <Link href="/" className="flex items-center space-x-2">
        {settings?.logo ? (
          <Image
            src={settings.logo}
            alt={settings.name}
            width={32}
            height={32}
            className="object-contain"
          />
        ) : (
          <Package className="h-6 w-6" />
        )}
        <span className="font-bold text-lg">{settings?.name || "TravelPortal"}</span>
      </Link>
    </div>
    <nav className="flex-1 p-4">
      <div className="space-y-1">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  (pathname.startsWith(item.href) && item.href != "/admin") || pathname === item.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-primary/5"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.title}</span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </nav>
    <div className="border-t p-4">
      <Button
        variant="ghost"
        className="w-full justify-start"
        onClick={() => signOut()}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Sair
      </Button>
    </div>
  </motion.div>
);

export function AdminSidebar({ isOpen, onClose, isMobile }: AdminSidebarProps) {
  const pathname = usePathname();
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(console.error);
  }, []);

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetTitle></SheetTitle>
        <SheetDescription></SheetDescription>
        <SheetContent side="left" className="w-[300px] p-0">
          <AnimatePresence mode="wait">
            {isOpen && <SidebarContent pathname={pathname} settings={settings} />}
          </AnimatePresence>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-800 border-r border-border fixed top-0 left-0 h-screen transition-all duration-300 w-64",
      )}
    >
      <SidebarContent pathname={pathname} settings={settings} />
    </div>
  );
}