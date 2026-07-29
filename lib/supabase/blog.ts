import type { BlogPost, Image } from "lib/types";
import { createServiceClient } from "./service";

function transformBlogPost(data: any): BlogPost {
  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    excerpt: data.excerpt || undefined,
    content: data.content || "",
    featuredImage: data.featured_image || undefined,
    images: data.images || [],
    seoTitle: data.seo_title || undefined,
    seoDescription: data.seo_description || undefined,
    published: data.published === true,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function getPublishedBlogPosts(limit?: number): Promise<BlogPost[]> {
  const supabase = createServiceClient();
  let query = supabase
    .from("blog_posts")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error || !data) return [];
  return data.map(transformBlogPost);
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug.trim())
    .eq("published", true)
    .single();

  if (error || !data) return null;
  return transformBlogPost(data);
}

export async function getRelatedBlogPosts(
  excludeId: string,
  limit = 3,
): Promise<BlogPost[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("published", true)
    .neq("id", excludeId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data.map(transformBlogPost);
}
