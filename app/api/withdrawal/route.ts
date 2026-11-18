import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { isValidEmail } from "lib/validation";
import { createContactInquiry } from "lib/supabase/admin-contact-inquiries";
import {
  sendWithdrawalConfirmationToCustomer,
  sendWithdrawalNotification,
  type WithdrawalData,
} from "lib/email";

// Online withdrawal function (чл. 52а ЗЗП / Directive 2011/83/EU, Art. 11a).
// Public endpoint: no login required. The statement is stored, the shop is
// notified, and the consumer gets a confirmation with content, date and time.

const NAME_MAX = 100;
const ORDER_MAX = 60;
const ITEMS_MAX = 1000;
const REASON_MAX = 1000;

// Best-effort, per-instance rate limiter (resets on cold start).
const RATE_LIMIT_MAX = 5;
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

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function formatSofiaTime(date: Date): string {
  return new Intl.DateTimeFormat("bg-BG", {
    timeZone: "Europe/Sofia",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

function makeReference(date: Date): string {
  const ymd = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Sofia",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(date)
    .replace(/-/g, "");
  return `OTK-${ymd}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Невалидна заявка." }, { status: 400 });
    }

    const raw = body as Record<string, unknown>;

    // Honeypot — bots fill hidden fields. Pretend success, store nothing.
    if (str(raw.website) !== "") {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        {
          error:
            "Твърде много заявки. Моля, опитайте отново след няколко минути или ни пишете на имейл.",
        },
        { status: 429 },
      );
    }

    const name = str(raw.name);
    const email = str(raw.email);
    const orderNumber = str(raw.orderNumber).replace(/^#/, "");
    const itemsMode = raw.itemsMode === "partial" ? "partial" : "all";
    const itemsText = str(raw.items);
    const reason = str(raw.reason);

    if (!name || name.length > NAME_MAX) {
      return NextResponse.json(
        { error: "Моля, въведете име и фамилия." },
        { status: 400 },
      );
    }
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Моля, въведете валиден имейл адрес." },
        { status: 400 },
      );
    }
    if (!orderNumber || orderNumber.length > ORDER_MAX) {
      return NextResponse.json(
        { error: "Моля, въведете номера на поръчката." },
        { status: 400 },
      );
    }
    if (itemsMode === "partial" && (!itemsText || itemsText.length > ITEMS_MAX)) {
      return NextResponse.json(
        { error: "Моля, посочете за кои артикули се отказвате." },
        { status: 400 },
      );
    }
    if (reason.length > REASON_MAX) {
      return NextResponse.json(
        { error: "Причината може да е до 1000 знака." },
        { status: 400 },
      );
    }

    const now = new Date();
    const data: WithdrawalData = {
      reference: makeReference(now),
      customerName: name,
      customerEmail: email,
      orderNumber,
      items:
        itemsMode === "all" ? "Всички артикули от поръчката" : itemsText,
      reason: reason || undefined,
      submittedAt: formatSofiaTime(now),
    };

    // 1) Persist first: the record is the proof of timely submission.
    let stored = false;
    try {
      await createContactInquiry({
        name,
        email,
        subject: `Отказ от договора ${data.reference} – поръчка ${orderNumber}`,
        message: [
          "ЗАЯВЛЕНИЕ ЗА ОТКАЗ ОТ ДОГОВОРА (чл. 52а ЗЗП)",
          `Номер на заявлението: ${data.reference}`,
          `Подадено на: ${data.submittedAt} (българско време), ${now.toISOString()} UTC`,
          `Номер на поръчката: ${orderNumber}`,
          `Артикули: ${data.items}`,
          reason ? `Причина (по желание): ${reason}` : "",
        ]
          .filter(Boolean)
          .join("\n"),
      });
      stored = true;
    } catch (error) {
      console.error("Withdrawal statement not stored:", error);
    }

    // 2) Confirmation to the consumer, 3) notification + copy to the shop.
    const customerResult = await sendWithdrawalConfirmationToCustomer(data);
    const shopResult = await sendWithdrawalNotification(
      data,
      customerResult.success,
    );

    if (!stored && !shopResult.success) {
      // Nothing reached us — do not tell the consumer it was received.
      return NextResponse.json(
        {
          error:
            "Възникна техническа грешка и заявлението не беше получено. Моля, опитайте отново или ни пишете на paperok.info@gmail.com.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        reference: data.reference,
        submittedAt: data.submittedAt,
        items: data.items,
        orderNumber,
        emailSent: customerResult.success,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Withdrawal route error:", error);
    return NextResponse.json(
      {
        error:
          "Възникна грешка. Моля, опитайте отново или ни пишете на paperok.info@gmail.com.",
      },
      { status: 500 },
    );
  }
}
