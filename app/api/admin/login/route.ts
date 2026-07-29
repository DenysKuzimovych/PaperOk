import { NextRequest, NextResponse } from "next/server";
import {
  setAdminSession,
  verifyAdminPassword,
} from "lib/admin-auth";

export async function POST(request: NextRequest) {
  try {
    if (!process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "ADMIN_PASSWORD не е конфигурирана в .env.local" },
        { status: 500 },
      );
    }

    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: "Паролата е задължителна" },
        { status: 400 },
      );
    }

    if (!verifyAdminPassword(password)) {
      return NextResponse.json(
        { error: "Грешна парола" },
        { status: 401 },
      );
    }

    await setAdminSession();

    return NextResponse.json({ success: true, message: "Успешно влизане" });
  } catch (error: any) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: error.message || "Грешка при влизане" },
      { status: 500 },
    );
  }
}
