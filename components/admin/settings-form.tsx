"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { SiteSettings } from "@prisma/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImagePlus, X } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

const settingsSchema = z.object({
  name: z.string().min(1, "Nome do site é obrigatório"),
  description: z.string().min(1, "Descrição do site é obrigatória"),
  logo: z.string().nullable().optional(),
  status: z.boolean(),
  smtpHost: z.string().nullable().optional(),
  smtpPort: z
    .string()
    .transform((val) => (val ? parseInt(val) : null))
    .nullable()
    .optional(),
  smtpUser: z.string().nullable().optional(),
  smtpPass: z.string().nullable().optional(),
  smtpFrom: z.string().email().nullable().optional(),
  facebookUrl: z.string().url().nullable().optional(),
  instagramUrl: z.string().url().nullable().optional(),
  twitterUrl: z.string().url().nullable().optional(),
  linkedinUrl: z.string().url().nullable().optional(),
  youtubeUrl: z.string().url().nullable().optional(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

interface SettingsFormProps {
  settings?: SiteSettings | null;
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isActive, setIsActive] = useState(settings?.status ?? true);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(
    settings?.logo || null
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      ...settings,
      status: isActive,
    },
  });

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Clean up old preview URL if it exists and it's not from the server
      if (logoPreview && !settings?.logo) {
        URL.revokeObjectURL(logoPreview);
      }
      setLogoFile(file);
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    if (logoPreview && !settings?.logo) {
      URL.revokeObjectURL(logoPreview);
    }
    setLogoPreview(null);
    setValue("logo", null);
  };

  const onSubmit = async (data: SettingsFormData) => {
    try {
      const formData = new FormData();

      // Handle logo
      if (logoFile) {
        formData.append("logo", logoFile);
      } else if (logoPreview && settings?.logo) {
        formData.append("existingLogo", settings.logo);
      } else {
        formData.append("removeLogo", "true");
      }

      // Add all other form data
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && key !== "logo") {
          formData.append(key, value.toString());
        }
      });

      const response = await fetch("/api/settings", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Falha ao salvar as configurações");

      toast({
        title: "Configurações Atualizadas",
        description: "As configurações do site foram salvas com sucesso.",
      });
      setTimeout(() => {
        window.location.reload();
        }, 100);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao salvar as configurações.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full md:w-1/2">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="general">
            <TabsList>
              <TabsTrigger value="general">Geral</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="social">Mídias Sociais</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Site</Label>
                  <Input id="name" {...register("name")} />
                  {errors.name && (
                    <p className="text-sm text-red-500">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="status"
                      checked={isActive}
                      onCheckedChange={(checked) => {
                        setIsActive(checked);
                        setValue("status", checked);
                      }}
                    />
                    <Label htmlFor="status">
                      {isActive ? "Ativo" : "Inativo"}
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição do Site</Label>
                <Textarea id="description" {...register("description")} />
                {errors.description && (
                  <p className="text-sm text-red-500">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <Label>Logo</Label>
                <AnimatePresence mode="wait">
                  {logoPreview ? (
                    <motion.div
                      key="logo"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="relative w-32 h-32 border rounded-lg overflow-hidden group"
                    >
                      <Image
                        src={logoPreview}
                        alt="Logo preview"
                        fill
                        className="object-contain"
                      />
                      <motion.button
                        type="button"
                        onClick={removeLogo}
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-red-500 hover:text-white transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </motion.button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="upload"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                    >
                      <Input
                        id="logo"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="hidden"
                      />
                      <Label
                        htmlFor="logo"
                        className="flex items-center justify-center w-32 h-32 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors"
                      >
                        <div className="flex flex-col items-center">
                          <ImagePlus className="h-8 w-8 text-muted-foreground" />
                          <span className="mt-2 text-sm text-muted-foreground">
                            Carregar Logo
                          </span>
                        </div>
                      </Label>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </TabsContent>

            <TabsContent value="email" className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost">SMTP Host</Label>
                  <Input id="smtpHost" {...register("smtpHost")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    type="number"
                    {...register("smtpPort")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpUser">SMTP Usuário</Label>
                  <Input id="smtpUser" {...register("smtpUser")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtpPass">SMTP Senha</Label>
                  <Input
                    id="smtpPass"
                    type="password"
                    {...register("smtpPass")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtpFrom">Endereço de Email do Remetente</Label>
                <Input id="smtpFrom" type="email" {...register("smtpFrom")} />
                {errors.smtpFrom && (
                  <p className="text-sm text-red-500">
                    {errors.smtpFrom.message}
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="social" className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="facebookUrl">URL do Facebook</Label>
                  <Input id="facebookUrl" {...register("facebookUrl")} />
                  {errors.facebookUrl && (
                    <p className="text-sm text-red-500">
                      {errors.facebookUrl.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instagramUrl">URL do Instagram</Label>
                  <Input id="instagramUrl" {...register("instagramUrl")} />
                  {errors.instagramUrl && (
                    <p className="text-sm text-red-500">
                      {errors.instagramUrl.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="twitterUrl">URL do Twitter</Label>
                  <Input id="twitterUrl" {...register("twitterUrl")} />
                  {errors.twitterUrl && (
                    <p className="text-sm text-red-500">
                      {errors.twitterUrl.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedinUrl">URL do LinkedIn</Label>
                  <Input id="linkedinUrl" {...register("linkedinUrl")} />
                  {errors.linkedinUrl && (
                    <p className="text-sm text-red-500">
                      {errors.linkedinUrl.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="youtubeUrl">URL do YouTube</Label>
                <Input id="youtubeUrl" {...register("youtubeUrl")} />
                {errors.youtubeUrl && (
                  <p className="text-sm text-red-500">
                    {errors.youtubeUrl.message}
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end">
            <Button type="submit">Salvar Configurações</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
