import { NextRequest, NextResponse } from "next/server";
import { sendBusinessInquiryEmail } from "lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, company, email, phone, productType, quantity, message } =
      body;

    if (!name || !email || !phone || !productType || !message) {
      return NextResponse.json(
        {
          error:
            "Име, имейл, телефон, вид продукт и съобщение са задължителни",
        },
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
      return NextResponse.json(
        { error: "Неуспешно изпращане на имейл. Моля, опитайте отново." },
        { status: 502 },
      );
    }

    return NextResponse.json(
      { success: true, message: "Business inquiry submitted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error processing business inquiry:", error);
    return NextResponse.json(
      { error: "Failed to send business inquiry email" },
      { status: 500 },
    );
  }
}
