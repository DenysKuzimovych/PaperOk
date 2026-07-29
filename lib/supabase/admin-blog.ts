import { createServiceClient } from "./service";
import type { Image } from "lib/types";

function isReactPostpone(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "$$typeof" in error &&
    error.$$typeof === Symbol.for("react.postpone")
  );
}

export interface CreateBlogPostData {
  slug: string;
  title: string;
  excerpt?: string;
  content: string;
  featured_image?: Image;
  images?: Image[];
  seo_title?: string;
  seo_description?: string;
  published?: boolean;
}

export interface UpdateBlogPostData extends Partial<CreateBlogPostData> {
  id: string;
}

export async function getAllBlogPostsForAdmin() {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error("Failed to fetch blog posts");
  return data || [];
}

export async function getBlogPostByIdForAdmin(id: string) {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}

async function checkSlugExists(slug: string, excludeId?: string) {
  const supabase = createServiceClient();
  let query = supabase.from("blog_posts").select("id").eq("slug", slug).limit(1);
  if (excludeId) query = query.neq("id", excludeId);
  const { data } = await query;
  return (data && data.length > 0) || false;
}

export async function createBlogPost(data: CreateBlogPostData) {
  const supabase = createServiceClient();
  const slug = data.slug.trim();

  if (await checkSlugExists(slug)) {
    throw new Error(`Slug "${slug}" вече е зает.`);
  }

  const { data: post, error } = await supabase
    .from("blog_posts")
    .insert({
      slug,
      title: data.title,
      excerpt: data.excerpt || null,
      content: data.content,
      featured_image: data.featured_image || null,
      images: data.images || [],
      seo_title: data.seo_title || null,
      seo_description: data.seo_description || null,
      published: data.published ?? false,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw new Error("Failed to create blog post");
  return post;
}

export async function updateBlogPost(data: UpdateBlogPostData) {
  const supabase = createServiceClient();
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (data.slug !== undefined) {
    const slug = data.slug.trim();
    if (await checkSlugExists(slug, data.id)) {
      throw new Error(`Slug "${slug}" вече е зает.`);
    }
    updateData.slug = slug;
  }
  if (data.title !== undefined) updateData.title = data.title;
  if (data.excerpt !== undefined) updateData.excerpt = data.excerpt || null;
  if (data.content !== undefined) updateData.content = data.content;
  if (data.featured_image !== undefined)
    updateData.featured_image = data.featured_image || null;
  if (data.images !== undefined) updateData.images = data.images || [];
  if (data.seo_title !== undefined) updateData.seo_title = data.seo_title || null;
  if (data.seo_description !== undefined)
    updateData.seo_description = data.seo_description || null;
  if (data.published !== undefined) updateData.published = data.published;

  const { data: post, error } = await supabase
    .from("blog_posts")
    .update(updateData)
    .eq("id", data.id)
    .select()
    .single();

  if (error) throw new Error("Failed to update blog post");
  return post;
}

export async function deleteBlogPost(id: string) {
  const supabase = createServiceClient();
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) throw new Error("Failed to delete blog post");
  return true;
}
