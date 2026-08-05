import { NextRequest, NextResponse } from "next/server";
import { sendContactFormEmail } from "lib/email";
import { createContactInquiry } from "lib/supabase/admin-contact-inquiries";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, message, subject } = body;

    if (!name || !email || !phone || !message) {
      return NextResponse.json(
        { error: "Име, имейл, телефон и съобщение са задължителни" },
        { status: 400 },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Невалиден формат на имейл" },
        { status: 400 },
      );
    }

    // Persist first so inquiries are never lost if email fails
    await createContactInquiry({
      name,
      email,
      phone,
      message,
      subject,
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
