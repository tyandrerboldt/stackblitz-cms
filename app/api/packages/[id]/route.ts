import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { saveImage, deleteImage } from "@/lib/image-upload";
import slugify from "slugify";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get the current package to find images to delete
    const currentPackage = await prisma.travelPackage.findUnique({
      where: { id: params.id },
      include: { images: true }
    });

    if (!currentPackage) {
      return NextResponse.json(
        { error: "Package not found" },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    
    // Handle new image uploads
    const imageFiles = formData.getAll('images') as File[];
    const imageUrls: string[] = [];
    
    for (const file of imageFiles) {
      const url = await saveImage(file);
      imageUrls.push(url);
    }

    // Get existing images that will be kept
    const existingImages = formData.getAll('existingImages') as string[];

    // Delete removed images
    const imagesToDelete = currentPackage.images
      .filter(img => !existingImages.includes(img.url))
      .map(img => img.url);

    for (const imageUrl of imagesToDelete) {
      await deleteImage(imageUrl);
    }

    // If main image was deleted, also delete it from the package
    if (imagesToDelete.includes(currentPackage.imageUrl)) {
      await deleteImage(currentPackage.imageUrl);
    }

    // Combine all images with their isMain status
    const allImages = [
      ...imageUrls.map((url, index) => ({
        url,
        isMain: formData.get(`imageIsMain${index}`) === 'true'
      })),
      ...existingImages.map(url => ({
        url,
        isMain: formData.get(`existingImageIsMain${url}`) === 'true'
      }))
    ];

    // Delete all existing images for this package from the database
    await prisma.packageImage.deleteMany({
      where: { packageId: params.id }
    });

    // Generate slug from title
    const title = formData.get('title') as string;
    const slug = slugify(title, { lower: true, strict: true });
    
    // Update package with new images and package type
    const packageData = await prisma.travelPackage.update({
      where: { id: params.id },
      data: {
        title,
        slug,
        code: formData.get('code') as string,
        description: formData.get('description') as string,
        location: formData.get('location') as string,
        price: parseFloat(formData.get('price') as string),
        startDate: new Date(formData.get('startDate') as string),
        endDate: new Date(formData.get('endDate') as string),
        maxGuests: parseInt(formData.get('maxGuests') as string),
        dormitories: parseInt(formData.get('dormitories') as string),
        suites: parseInt(formData.get('suites') as string),
        bathrooms: parseInt(formData.get('bathrooms') as string),
        numberOfDays: parseInt(formData.get('numberOfDays') as string),
        status: formData.get('status') as any,
        typeId: formData.get('typeId') as string,
        imageUrl: allImages.find(img => img.isMain)?.url || allImages[0]?.url || '',
        images: {
          create: allImages.map(img => ({
            url: img.url,
            isMain: img.isMain
          }))
        }
      },
      include: {
        images: true,
        packageType: true
      }
    });

    return NextResponse.json(packageData);
  } catch (error) {
    console.error('Failed to update package:', error);
    return NextResponse.json(
      { error: "Failed to update package" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get the package with its images before deletion
    const packageToDelete = await prisma.travelPackage.findUnique({
      where: { id: params.id },
      include: { images: true }
    });

    if (!packageToDelete) {
      return NextResponse.json(
        { error: "Package not found" },
        { status: 404 }
      );
    }

    // Delete all image files
    await Promise.all([
      deleteImage(packageToDelete.imageUrl),
      ...packageToDelete.images.map(img => deleteImage(img.url))
    ]);

    // Delete the package (this will cascade delete the images from the database)
    await prisma.travelPackage.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete package" },
      { status: 500 }
    );
  }
}