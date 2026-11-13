"use server";

import { isAdmin } from "lib/supabase/auth";
import {
  deleteReview,
  updateReviewStatus,
  type ReviewStatus,
} from "lib/supabase/reviews";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  if (!(await isAdmin())) {
    throw new Error("Няма достъп");
  }
}

export async function setReviewStatusAction(id: string, status: ReviewStatus) {
  try {
    await requireAdmin();
    await updateReviewStatus(id, status);
    revalidatePath("/admin/reviews");
    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Грешка при промяна на статуса",
    };
  }
}

export async function deleteReviewAction(id: string) {
  try {
    await requireAdmin();
    await deleteReview(id);
    revalidatePath("/admin/reviews");
    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Грешка при изтриване",
    };
  }
}
