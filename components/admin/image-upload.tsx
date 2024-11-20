"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PackageImage } from "@prisma/client";
import { ImagePlus, X, Star } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  existingImages?: PackageImage[];
  onImagesChange: (images: { file?: File; url: string; isMain: boolean }[]) => void;
}

export function ImageUpload({ existingImages = [], onImagesChange }: ImageUploadProps) {
  const [images, setImages] = useState<{ file?: File; url: string; isMain: boolean }[]>(
    existingImages.map(img => ({
      url: img.url,
      isMain: img.isMain,
    }))
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Create URLs for preview
    const newImages = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      isMain: false
    }));

    const updatedImages = [...images, ...newImages];
    
    // If no main image is set, make the first one main
    if (!updatedImages.some(img => img.isMain) && updatedImages.length > 0) {
      updatedImages[0].isMain = true;
    }

    setImages(updatedImages);
    onImagesChange(updatedImages);
  };

  const removeImage = (index: number) => {
    const updatedImages = [...images];
    const removedImage = updatedImages[index];
    
    // If removing the main image, set the first remaining image as main
    if (removedImage.isMain && updatedImages.length > 1) {
      const nextImage = updatedImages.find((_, i) => i !== index);
      if (nextImage) nextImage.isMain = true;
    }
    
    // Revoke object URL if it's a new image
    if (removedImage.file) {
      URL.revokeObjectURL(removedImage.url);
    }
    
    updatedImages.splice(index, 1);
    setImages(updatedImages);
    onImagesChange(updatedImages);
  };

  const setMainImage = (index: number) => {
    const updatedImages = images.map((img, i) => ({
      ...img,
      isMain: i === index
    }));
    setImages(updatedImages);
    onImagesChange(updatedImages);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Imagens</Label>
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImagePlus className="mr-2 h-4 w-4" />
          Adicionar
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div
            key={index}
            className="relative group aspect-square rounded-lg overflow-hidden border"
          >
            <Image
              src={image.url}
              alt={`Imagem ${index + 1}`}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setMainImage(index)}
                  className={cn(
                    "p-1.5 rounded-full",
                    image.isMain
                      ? "bg-yellow-500 text-white"
                      : "bg-white/80 hover:bg-yellow-500 hover:text-white"
                  )}
                >
                  <Star className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="p-1.5 rounded-full bg-white/80 hover:bg-red-500 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            {image.isMain && (
              <div className="absolute bottom-2 left-2 px-2 py-1 bg-yellow-500 text-white text-xs rounded">
                Principal
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}