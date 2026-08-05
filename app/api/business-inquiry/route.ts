import { NextRequest, NextResponse } from "next/server";
import { sendBusinessInquiryEmail } from "lib/email";
import { createContactInquiry } from "lib/supabase/admin-contact-inquiries";
import { isValidEmail, isValidPhone, VALIDATION_MESSAGES } from "lib/validation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, company, email, phone, productType, quantity, message } =
      body;

    if (
      !name?.trim() ||
      !email?.trim() ||
      !phone?.trim() ||
      !productType?.trim() ||
      !message?.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "Име, имейл, телефон, вид продукт и съобщение са задължителни",
        },
        { status: 400 },
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: VALIDATION_MESSAGES.email },
        { status: 400 },
      );
    }

    if (!isValidPhone(phone)) {
      return NextResponse.json(
        { error: VALIDATION_MESSAGES.phone },
        { status: 400 },
      );
    }

    const subject = `Бизнес: ${String(productType).trim()}`;
    const messageParts = [
      company?.trim() ? `Фирма: ${String(company).trim()}` : null,
      `Вид продукт: ${String(productType).trim()}`,
      quantity?.trim() ? `Количество: ${String(quantity).trim()}` : null,
      "",
      String(message).trim(),
    ].filter((line) => line !== null);

    // Persist first — inquiries must appear in admin even if email fails
    await createContactInquiry({
      name: String(name).trim(),
      email: String(email).trim(),
      phone: String(phone).trim(),
      subject,
      message: messageParts.join("\n"),
    });

    const result = await sendBusinessInquiryEmail({
      name,
      company,
      email,
      phone,
      productType,
      quantity,
      message,
    });

    if (!result.success) {
      console.warn(
        "Business inquiry saved, but email notification failed:",
        result.error,
      );
    }

    return NextResponse.json(
      { success: true, message: "Business inquiry submitted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error processing business inquiry:", error);
    return NextResponse.json(
      {
        error:
          "Грешка при изпращане на запитването. Моля, опитайте отново.",
      },
      { status: 500 },
    );
  }
}
