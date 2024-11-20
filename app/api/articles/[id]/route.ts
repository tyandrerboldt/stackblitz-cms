import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import slugify from "slugify";
import { saveImage, deleteImage } from "@/lib/image-upload";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const slug = slugify(title, { lower: true, strict: true });
    
    // Get current article to check for image changes
    const currentArticle = await prisma.article.findUnique({
      where: { id: params.id }
    });

    if (!currentArticle) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    // Handle image upload/removal
    const imageFile = formData.get('image') as File;
    const existingImage = formData.get('existingImage') as string;
    const removeImage = formData.get('removeImage') === 'true';
    let imageUrl = existingImage;

    // Delete current image if we're uploading a new one or removing the image entirely
    if ((imageFile || removeImage) && currentArticle.imageUrl) {
      await deleteImage(currentArticle.imageUrl);
    }

    // Set new image URL if uploading, or empty string if removing
    if (imageFile) {
      imageUrl = await saveImage(imageFile, 'articles');
    } else if (removeImage) {
      imageUrl = '';
    }
    
    const article = await prisma.article.update({
      where: { id: params.id },
      data: {
        title,
        slug,
        content: formData.get('content') as string,
        excerpt: formData.get('excerpt') as string,
        imageUrl,
        published: formData.get('published') === 'true',
        categoryId: formData.get('categoryId') as string,
      }
    });
    
    return NextResponse.json(article);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update article" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get the article to delete its image
    const article = await prisma.article.findUnique({
      where: { id: params.id }
    });

    if (article?.imageUrl) {
      await deleteImage(article.imageUrl);
    }

    await prisma.article.delete({
      where: { id: params.id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete article" },
      { status: 500 }
    );
  }
}