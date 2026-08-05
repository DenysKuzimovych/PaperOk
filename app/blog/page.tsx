import Footer from "components/layout/footer";
import { Reveal } from "components/ui/reveal";
import { PaperTexture } from "components/ui/paper-texture";
import { PAPER_BACKGROUNDS, PAPER_OVERLAYS } from "lib/backgrounds";
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
      <div className="relative overflow-hidden bg-paper-bg">
        <PaperTexture
          src={PAPER_BACKGROUNDS.fibers}
          overlay={PAPER_OVERLAYS.cream}
          sizes="100vw"
          quality={85}
        />
        <div className="relative z-10 mx-auto max-w-6xl px-4 py-12">
          <Reveal>
            <h1 className="font-heading mb-2 text-4xl font-bold text-paper-heading">
              Блог
            </h1>
            <p className="mb-10 text-paper-text">
              Идеи, съвети и вдъхновение от света на семенната хартия
            </p>
          </Reveal>

          {posts.length === 0 ? (
            <p className="text-paper-muted">Все още няма публикувани статии.</p>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post, index) => (
                <Reveal key={post.id} delay={index * 80} variant="up">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group hover-lift block overflow-hidden rounded-lg border border-paper-border bg-paper-white/90"
                  >
                    {post.featuredImage?.url && (
                      <div className="overflow-hidden">
                        <img
                          src={post.featuredImage.url}
                          alt={post.title}
                          className="img-zoom h-48 w-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <time className="text-xs text-paper-muted">
                        {new Date(post.createdAt).toLocaleDateString("bg-BG")}
                      </time>
                      <h2 className="font-heading mt-1 text-lg font-semibold text-paper-heading transition-colors group-hover:text-paper-green">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="mt-2 line-clamp-3 text-sm text-paper-text">
                          {post.excerpt}
                        </p>
                      )}
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
