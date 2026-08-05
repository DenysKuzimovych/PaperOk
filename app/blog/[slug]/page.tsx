import Footer from "components/layout/footer";
import { PaperTexture } from "components/ui/paper-texture";
import { PAPER_BACKGROUNDS, PAPER_OVERLAYS } from "lib/backgrounds";
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
  const formattedDate = new Date(post.createdAt).toLocaleDateString("bg-BG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <div className="relative min-h-screen overflow-hidden bg-paper-bg">
        <PaperTexture
          src={PAPER_BACKGROUNDS.seeds}
          overlay={PAPER_OVERLAYS.cream}
          sizes="100vw"
          quality={88}
        />
        <article className="relative z-10 mx-auto max-w-3xl px-4 py-12">
          <div
            className="relative overflow-hidden rounded-[1.35rem] border border-paper-border/70 p-6 sm:p-8 md:p-10"
            style={{ boxShadow: "var(--paper-shadow)" }}
          >
            <PaperTexture
              src={PAPER_BACKGROUNDS.petalsSoft}
              overlay="rgba(255, 252, 247, 0.84)"
              sizes="(min-width: 768px) 48rem, 100vw"
              quality={86}
            />
            <div className="relative z-10">
              <div className="mb-6 flex items-start justify-between gap-4">
                <Link
                  href="/blog"
                  className="inline-block text-sm text-paper-green transition-colors hover:text-paper-green-hover"
                >
                  ← Обратно към блога
                </Link>
                <time className="shrink-0 text-right text-sm text-paper-muted">
                  {formattedDate}
                </time>
              </div>

              <h1 className="font-heading mb-6 text-4xl font-bold text-paper-heading">
                {post.title}
              </h1>

              {post.featuredImage?.url && (
                <img
                  src={post.featuredImage.url}
                  alt={post.title}
                  className="mb-8 max-h-96 w-full rounded-lg object-cover"
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
            </div>
          </div>

          {related.length > 0 && (
            <section className="mt-12 border-t border-paper-border/70 pt-8">
              <h2 className="font-heading mb-6 text-2xl font-bold text-paper-heading">
                Свързани статии
              </h2>
              <div className="grid gap-5 sm:grid-cols-3">
                {related.map((r) => (
                  <Link
                    key={r.id}
                    href={`/blog/${r.slug}`}
                    className="group hover-lift overflow-hidden rounded-xl border border-paper-border/60 bg-paper-white/80 transition-colors hover:border-paper-green/40"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-paper-section">
                      {r.featuredImage?.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={r.featuredImage.url}
                          alt={r.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-paper-accent-bg/60">
                          <span className="font-heading text-sm text-paper-muted">
                            PaperOK
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <time className="text-xs text-paper-muted">
                        {new Date(r.createdAt).toLocaleDateString("bg-BG")}
                      </time>
                      <h3 className="font-heading mt-1 text-sm font-semibold text-paper-heading transition-colors group-hover:text-paper-green">
                        {r.title}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>
      </div>
      <Footer />
    </>
  );
}
