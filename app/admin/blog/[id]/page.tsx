import { getBlogPostByIdForAdmin } from "lib/supabase/admin-blog";
import { BlogForm } from "components/admin/blog-form";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function EditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getBlogPostByIdForAdmin(id);
  if (!post) notFound();

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        href="/admin/blog"
        className="text-indigo-600 text-sm mb-4 inline-block"
      >
        ← Назад към блога
      </Link>
      <h1 className="text-3xl font-bold mb-8">Редактирай Статия</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <BlogForm post={post} />
      </div>
    </div>
  );
}
