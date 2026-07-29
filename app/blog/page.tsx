import Footer from "components/layout/footer";
import { getPublishedBlogPosts } from "lib/supabase/blog";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Блог | PaperOK",
  description: "Статии за семенна хартия, еко подаръци и устойчиви идеи.",
};

export default async function BlogPage() {
  const posts = await getPublishedBlogPosts();

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="font-heading mb-2 text-4xl font-bold text-paper-heading">Блог</h1>
        <p className="mb-10 text-paper-text">
          Идеи, съвети и вдъхновение от света на семенната хартия
        </p>

        {posts.length === 0 ? (
          <p className="text-paper-muted">Все още няма публикувани статии.</p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group overflow-hidden rounded-lg border border-paper-border bg-paper-white hover:shadow-lg transition-shadow"
              >
                {post.featuredImage?.url && (
                  <img
                    src={post.featuredImage.url}
                    alt={post.title}
                    className="h-48 w-full object-cover"
                  />
                )}
                <div className="p-4">
                  <time className="text-xs text-paper-muted">
                    {new Date(post.createdAt).toLocaleDateString("bg-BG")}
                  </time>
                  <h2 className="font-heading mt-1 text-lg font-semibold text-paper-heading group-hover:text-paper-green">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="mt-2 text-sm text-paper-text line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
