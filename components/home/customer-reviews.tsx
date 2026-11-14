import { getApprovedReviews } from "lib/supabase/reviews";
import { Section } from "./section";
import { ReviewForm } from "./review-form";
import { ReviewsCarousel } from "./reviews-carousel";

export async function CustomerReviews() {
  const reviews = await getApprovedReviews(30);

  return (
    <Section
      id="reviews"
      title="Споделете мнението си"
      subtitle="Истински отзиви от клиенти — и място да добавите своя"
      variant="muted"
    >
      <ReviewsCarousel reviews={reviews} />

      <ReviewForm />
    </Section>
  );
}
