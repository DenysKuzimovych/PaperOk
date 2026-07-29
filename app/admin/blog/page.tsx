import { getAllBlogPostsForAdmin } from "lib/supabase/admin-blog";
import Link from "next/link";
import { DeleteBlogButton } from "components/admin/delete-blog-button";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminBlogPage() {
  const posts = await getAllBlogPostsForAdmin();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Блог
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Управление на статии
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          + Нова Статия
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Заглавие
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Slug
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Статус
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Дата
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {posts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  Няма статии
                </td>
              </tr>
            ) : (
              posts.map((post: any) => (
                <tr key={post.id}>
                  <td className="px-6 py-4 text-sm font-medium">{post.title}</td>
                  <td className="px-6 py-4 text-sm font-mono text-gray-500">
                    {post.slug}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {post.published ? (
                      <span className="text-green-600">Публикувана</span>
                    ) : (
                      <span className="text-gray-400">Чернова</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(post.created_at).toLocaleDateString("bg-BG")}
                  </td>
                  <td className="px-6 py-4 text-sm flex gap-2">
                    <Link
                      href={`/admin/blog/${post.id}`}
                      className="text-indigo-600"
                    >
                      Редактирай
                    </Link>
                    <DeleteBlogButton postId={post.id} postTitle={post.title} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
