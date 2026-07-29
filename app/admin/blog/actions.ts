"use server";

import {
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  type CreateBlogPostData,
  type UpdateBlogPostData,
} from "lib/supabase/admin-blog";
import { revalidatePath } from "next/cache";

export async function createBlogPostAction(data: CreateBlogPostData) {
  try {
    const post = await createBlogPost(data);
    revalidatePath("/admin/blog");
    revalidatePath("/blog");
    return { success: true, post };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateBlogPostAction(data: UpdateBlogPostData) {
  try {
    const post = await updateBlogPost(data);
    revalidatePath("/admin/blog");
    revalidatePath("/blog");
    revalidatePath(`/blog/${post.slug}`);
    return { success: true, post };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteBlogPostAction(id: string) {
  try {
    await deleteBlogPost(id);
    revalidatePath("/admin/blog");
    revalidatePath("/blog");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
