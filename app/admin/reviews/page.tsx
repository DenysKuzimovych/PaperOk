import { getAllReviews } from "lib/supabase/reviews";
import { formatDateTimeBg } from "lib/utils";
import { ReviewActions } from "components/admin/review-actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function statusLabel(status: string) {
  if (status === "pending") return "Чака преглед";
  if (status === "approved") return "Одобрен";
  if (status === "rejected") return "Скрит";
  return status;
}

function statusClass(status: string) {
  if (status === "pending") {
    return "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200";
  }
  if (status === "approved") {
    return "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-200";
  }
  return "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300";
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-amber-500" aria-label={`${rating} от 5`}>
      {"★".repeat(rating)}
      <span className="text-gray-300 dark:text-gray-600">
        {"★".repeat(5 - rating)}
      </span>
    </span>
  );
}

export default async function AdminReviewsPage() {
  const reviews = await getAllReviews();
  const pendingCount = reviews.filter((r) => r.status === "pending").length;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Отзиви
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Отзиви от сайта. Одобрените се показват на началната страница
          {pendingCount > 0 ? ` · ${pendingCount} чакат преглед` : ""}
        </p>
      </div>

      {reviews.length === 0 ? (
        <div className="rounded-lg bg-white p-8 text-center text-gray-500 shadow dark:bg-gray-800 dark:text-gray-400">
          Все още няма отзиви.
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-lg bg-white p-5 shadow dark:bg-gray-800"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <Stars rating={review.rating} />
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {review.author_name}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusClass(review.status)}`}
                  >
                    {statusLabel(review.status)}
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  {formatDateTimeBg(review.created_at)}
                </span>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                {review.body}
              </p>
              <div className="mt-4">
                <ReviewActions id={review.id} status={review.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
