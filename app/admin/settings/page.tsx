import { SettingsForm } from "@/components/admin/settings-form";
import { PageTransition } from "@/components/page-transition";
import { prisma } from "@/lib/prisma";

export default async function AdminSettings() {
  const settings = await prisma.siteSettings.findFirst({
    where: { id: "default" },
  });

  return (
    <PageTransition>
      <div>
        <h1 className="text-3xl font-bold mb-6">Configurações</h1>
        <SettingsForm settings={settings} />
      </div>
    </PageTransition>
  );
}
