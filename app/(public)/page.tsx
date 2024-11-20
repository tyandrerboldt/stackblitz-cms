import { prisma } from "@/lib/prisma";
import { PackageCard } from "@/components/packages/package-card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { PageTransition } from "@/components/page-transition";
import { motion } from "framer-motion";

export default async function Home() {
  const featuredPackages = await prisma.travelPackage.findMany({
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <PageTransition>
      {/* Seção Hero */}
      <section className="relative h-[600px] flex items-center justify-center text-white">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1469474968028-56623f02e42e')",
          }}
        >
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center max-w-3xl mx-auto px-4"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl font-bold mb-6"
          >
            Descubra Sua Próxima Aventura
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl mb-8"
          >
            Explore nossa seleção exclusiva de destinos de viagem incríveis e crie memórias inesquecíveis.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Link href="/packages">
              <Button size="lg" className="text-lg">
                Ver Pacotes
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Pacotes em Destaque */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <div className="flex justify-between items-center mb-8">
              <motion.h2
                variants={itemVariants}
                className="text-3xl font-bold"
              >
                Pacotes em Destaque
              </motion.h2>
              <motion.div variants={itemVariants}>
                <Link href="/packages">
                  <Button variant="ghost">
                    Ver Todos
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </motion.div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPackages.map((pkg, index) => (
                <motion.div
                  key={pkg.id}
                  variants={itemVariants}
                  transition={{ delay: index * 0.2 }}
                >
                  <PackageCard package={pkg} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </PageTransition>
  );
}