import { BlogForm } from "components/admin/blog-form";

export default function NewBlogPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Нова Статия</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <BlogForm />
      </div>
    </div>
  );
}
