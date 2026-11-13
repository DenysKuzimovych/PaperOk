import { NextRequest, NextResponse } from "next/server";
import { createReview } from "lib/supabase/reviews";

// Public endpoint: anyone can submit a review. It is stored as "pending"
// and only shown on the site after an admin approves it in /admin/reviews.

const NAME_MIN = 2;
const NAME_MAX = 60;
const BODY_MIN = 10;
const BODY_MAX = 1000;

// Best-effort, per-instance rate limiter (resets on cold start). A second,
// lightweight layer on top of moderation — not the main defense.
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS,
  );
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_LIMIT_MAX;
}

function countLinks(text: string): number {
  const matches = text.match(/https?:\/\/|www\.|\[url/gi);
  return matches ? matches.length : 0;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Невалидна заявка" }, { status: 400 });
    }

    const {
      author_name: authorName,
      rating,
      body: reviewBody,
      website, // honeypot: must stay empty
    } = body as Record<string, unknown>;

    // Honeypot — bots fill hidden fields. Pretend success, store nothing.
    if (typeof website === "string" && website.trim() !== "") {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    const name = typeof authorName === "string" ? authorName.trim() : "";
    const text = typeof reviewBody === "string" ? reviewBody.trim() : "";
    const ratingNum =
      typeof rating === "number" ? rating : Number.parseInt(String(rating), 10);

    if (name.length < NAME_MIN || name.length > NAME_MAX) {
      return NextResponse.json(
        { error: "Моля, въведете име (между 2 и 60 знака)." },
        { status: 400 },
      );
    }

    if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json(
        { error: "Моля, изберете оценка от 1 до 5 звезди." },
        { status: 400 },
      );
    }

    if (text.length < BODY_MIN || text.length > BODY_MAX) {
      return NextResponse.json(
        { error: "Отзивът трябва да е между 10 и 1000 знака." },
        { status: 400 },
      );
    }

    // Simple spam heuristic — links are not expected in a customer review.
    if (countLinks(text) > 1) {
      return NextResponse.json(
        { error: "Моля, не добавяйте връзки в отзива." },
        { status: 400 },
      );
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Твърде много опити. Моля, опитайте по-късно." },
        { status: 429 },
      );
    }

    await createReview({
      author_name: name,
      rating: ratingNum,
      body: text,
      source: "form",
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Благодарим Ви за отзива! Той ще се появи след преглед от екипа.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error processing review:", error);
    return NextResponse.json(
      { error: "Грешка при изпращане. Моля, опитайте отново." },
      { status: 500 },
    );
  }
}
