import { getApprovedReviews } from "lib/supabase/reviews";
import { Section } from "./section";
import { ReviewForm } from "./review-form";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5 text-paper-green" aria-label={`${rating} от 5 звезди`}>
      {[1, 2, 3, 4, 5].map((value) => (
        <svg
          key={value}
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill={value <= rating ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden
        >
          <path
            strokeLinejoin="round"
            d="M12 3.5l2.6 5.27 5.82.85-4.21 4.1.99 5.78L12 16.77l-5.2 2.73.99-5.78-4.21-4.1 5.82-.85L12 3.5z"
          />
        </svg>
      ))}
    </div>
  );
}

export async function CustomerReviews() {
  const reviews = await getApprovedReviews(9);

  return (
    <Section
      id="reviews"
      title="Споделете мнението си"
      subtitle="Истински отзиви от клиенти — и място да добавите своя"
      variant="muted"
    >
      {reviews.length > 0 && (
        <ul className="mx-auto mb-12 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <li
              key={review.id}
              className="flex h-full flex-col rounded-[1.25rem] border border-paper-border/60 bg-paper-white p-5 shadow-[var(--paper-shadow)]"
            >
              <Stars rating={review.rating} />
              <p className="mt-3 flex-1 text-paper-text">{review.body}</p>
              <p className="mt-4 text-sm font-semibold text-paper-heading">
                {review.author_name}
              </p>
            </li>
          ))}
        </ul>
      )}

      <ReviewForm />
    </Section>
  );
}
