"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageTransition } from "@/components/page-transition";
import { motion } from "framer-motion";
import { Chrome } from "lucide-react";

export default function SignIn() {
  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Bem-vindo de Volta</CardTitle>
            <CardDescription>Faça login para acessar sua conta</CardDescription>
          </CardHeader>
          <CardContent>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                className="w-full flex items-center justify-center gap-2"
                onClick={() => signIn("google", { callbackUrl: "/" })}
              >
                <Chrome className="h-5 w-5" />
                Entrar com Google
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}