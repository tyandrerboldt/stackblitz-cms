import { prisma } from "@/lib/prisma";
import { DashboardStats } from "@/components/admin/dashboard-stats";
import { RecentPackages } from "@/components/admin/recent-packages";
import { RecentArticles } from "@/components/admin/recent-articles";
import { TrendingPackages } from "@/components/admin/trending-packages";
import { PackageTypeChart } from "@/components/admin/package-type-chart";
import { PageTransition } from "@/components/page-transition";

export default async function AdminDashboard() {
  const [recentPackages, recentArticles, trendingPackages, packageStats] =
    await Promise.all([
      // Get recent packages
      prisma.travelPackage.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          packageType: true,
        },
      }),
      // Get recent articles
      prisma.article.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          category: true,
        },
      }),
      // Get trending packages
      prisma.travelPackage.findMany({
        take: 5,
        orderBy: { contactCount: "desc" },
        include: {
          packageType: true,
        },
      }),
      // Get package type stats
      prisma.packageType.findMany({
        include: {
          _count: {
            select: { packages: true },
          },
        },
      }),
    ]);

  // Calculate total stats
  const totalPackages = await prisma.travelPackage.count();
  const totalArticles = await prisma.article.count();
  const totalContacts = await prisma.travelPackage.aggregate({
    _sum: {
      contactCount: true,
    },
  });

  const stats = {
    totalPackages,
    totalArticles,
    totalContacts: totalContacts._sum.contactCount || 0,
  };

  return (
    <PageTransition>
      <div className="space-y-8 w-full 3xl:w-2/3">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        <DashboardStats stats={stats} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <RecentPackages packages={recentPackages} />
          <RecentArticles articles={recentArticles} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <TrendingPackages packages={trendingPackages} />
          <PackageTypeChart packageStats={packageStats} />
        </div>
      </div>
    </PageTransition>
  );
}
