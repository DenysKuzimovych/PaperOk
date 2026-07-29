import Footer from "components/layout/footer";
import {
  getBlogPostBySlug,
  getRelatedBlogPosts,
} from "lib/supabase/blog";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return { title: "Статия не е намерена" };

  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt || post.title,
    openGraph: post.featuredImage?.url
      ? { images: [{ url: post.featuredImage.url }] }
      : undefined,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const related = await getRelatedBlogPosts(post.id);

  return (
    <>
      <article className="mx-auto max-w-3xl px-4 py-12">
        <Link href="/blog" className="text-sm text-paper-green mb-4 inline-block">
          ← Обратно към блога
        </Link>
        <time className="text-sm text-paper-muted">
          {new Date(post.createdAt).toLocaleDateString("bg-BG", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
        <h1 className="font-heading mt-2 mb-6 text-4xl font-bold text-paper-heading">{post.title}</h1>

        {post.featuredImage?.url && (
          <img
            src={post.featuredImage.url}
            alt={post.title}
            className="mb-8 w-full rounded-lg object-cover max-h-96"
          />
        )}

        <div className="prose prose-stone max-w-none whitespace-pre-wrap text-paper-text">
          {post.content}
        </div>

        {post.images.length > 0 && (
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {post.images.map((img, i) => (
              <img
                key={img.id || i}
                src={img.url}
                alt={img.altText || post.title}
                className="w-full rounded-lg object-cover"
              />
            ))}
          </div>
        )}

        {related.length > 0 && (
          <section className="mt-16 border-t border-paper-border pt-8">
            <h2 className="font-heading mb-6 text-2xl font-bold text-paper-heading">Свързани статии</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/blog/${r.slug}`}
                  className="text-sm text-paper-text hover:text-paper-green"
                >
                  {r.title}
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
      <Footer />
    </>
  );
}
