"use client";

import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminHeader } from "@/components/admin/header";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Breadcrumbs } from "@/components/admin/breadcrumbs";
import AuthProvider from "@/components/auth-provider";
import { ThemeProvider } from "@/components/theme-provider";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
          <AdminSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            isMobile={isMobile}
          />
          <div
            className={cn(
              "transition-all duration-300",
              !isMobile ? "ml-64" : "ml-0"
            )}
          >
            <AdminHeader
              onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
              isMobile={isMobile}
            />
            <main className="p-8">
              <Breadcrumbs />
              {children}
            </main>
          </div>
        </div>
      </ThemeProvider>
    </AuthProvider>
  );
}
