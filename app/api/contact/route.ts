import { NextRequest, NextResponse } from "next/server";
import { sendContactFormEmail } from "lib/email";
import { createContactInquiry } from "lib/supabase/admin-contact-inquiries";
import { isValidEmail, isValidPhone, VALIDATION_MESSAGES } from "lib/validation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, message, subject } = body;

    if (!name?.trim() || !email?.trim() || !phone?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: "Име, имейл, телефон и съобщение са задължителни" },
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

    // Persist first so inquiries are never lost if email fails
    await createContactInquiry({
      name,
      email,
      phone,
      message,
      subject: subject?.trim() || "Контакти",
    });

    const result = await sendContactFormEmail({
      name,
      email,
      phone,
      message,
      subject,
    });

    if (!result.success) {
      console.warn(
        "Contact inquiry saved, but email notification failed:",
        result.error,
      );
    }

    return NextResponse.json(
      { success: true, message: "Contact form submitted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error processing contact form:", error);
    return NextResponse.json(
      { error: "Грешка при изпращане на съобщението. Моля, опитайте отново." },
      { status: 500 },
    );
  }
}
