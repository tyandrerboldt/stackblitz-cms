import { ArticleCategoryForm } from "@/components/admin/article-category-form";

export default function NewArticleCategory() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Criar Categoria</h1>
      <ArticleCategoryForm />
    </div>
  );
}