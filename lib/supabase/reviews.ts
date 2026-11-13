import { createServiceClient } from "./service";

function isReactPostpone(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "$$typeof" in error &&
    (error as { $$typeof?: symbol }).$$typeof === Symbol.for("react.postpone")
  );
}

export type ReviewStatus = "pending" | "approved" | "rejected";
export type ReviewSource = "form" | "instagram" | "manual";

export type Review = {
  id: string;
  author_name: string;
  rating: number;
  body: string;
  status: ReviewStatus;
  source: ReviewSource;
  created_at: string;
  updated_at: string;
};

export type CreateReviewData = {
  author_name: string;
  rating: number;
  body: string;
  source?: ReviewSource;
};

export async function createReview(data: CreateReviewData): Promise<Review> {
  try {
    const supabase = createServiceClient();

    const { data: review, error } = await supabase
      .from("reviews")
      .insert({
        author_name: data.author_name.trim(),
        rating: data.rating,
        body: data.body.trim(),
        status: "pending",
        source: data.source ?? "form",
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating review:", error);
      throw new Error("Неуспешно запазване на отзива");
    }

    return review as Review;
  } catch (error) {
    if (isReactPostpone(error)) throw error;
    console.error("Error in createReview:", error);
    throw error;
  }
}

/** Approved reviews for the public homepage, newest first. */
export async function getApprovedReviews(limit = 12): Promise<Review[]> {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching approved reviews:", error);
      return [];
    }

    return (data || []) as Review[];
  } catch (error) {
    if (isReactPostpone(error)) throw error;
    console.error("Error in getApprovedReviews:", error);
    return [];
  }
}

/** All reviews for the admin moderation page, newest first. */
export async function getAllReviews(): Promise<Review[]> {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching reviews:", error);
      throw new Error("Неуспешно зареждане на отзивите");
    }

    return (data || []) as Review[];
  } catch (error) {
    if (isReactPostpone(error)) throw error;
    console.error("Error in getAllReviews:", error);
    throw error;
  }
}

export async function updateReviewStatus(
  id: string,
  status: ReviewStatus,
): Promise<Review> {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("reviews")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating review status:", error);
      throw new Error("Неуспешна промяна на статуса");
    }

    return data as Review;
  } catch (error) {
    if (isReactPostpone(error)) throw error;
    console.error("Error in updateReviewStatus:", error);
    throw error;
  }
}

export async function deleteReview(id: string): Promise<void> {
  try {
    const supabase = createServiceClient();

    const { error } = await supabase.from("reviews").delete().eq("id", id);

    if (error) {
      console.error("Error deleting review:", error);
      throw new Error("Неуспешно изтриване на отзива");
    }
  } catch (error) {
    if (isReactPostpone(error)) throw error;
    console.error("Error in deleteReview:", error);
    throw error;
  }
}
