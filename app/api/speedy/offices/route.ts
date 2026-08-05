import { NextRequest, NextResponse } from "next/server";
import {
  findOffices,
  formatOfficeLabel,
  isSpeedyConfigured,
  type SpeedyOfficeType,
} from "lib/speedy";

export async function GET(request: NextRequest) {
  try {
    if (!isSpeedyConfigured()) {
      return NextResponse.json(
        { error: "Speedy не е конфигуриран" },
        { status: 503 },
      );
    }

    const siteId = Number(request.nextUrl.searchParams.get("siteId"));
    const type = request.nextUrl.searchParams.get("type") as SpeedyOfficeType | null;

    if (!siteId || Number.isNaN(siteId)) {
      return NextResponse.json(
        { error: "Липсва населено място" },
        { status: 400 },
      );
    }

    const officeType =
      type === "OFFICE" || type === "APT" ? type : undefined;
    const offices = await findOffices(siteId, officeType);

    return NextResponse.json({
      offices: offices.map((o) => ({
        id: o.id,
        name: o.name,
        nameEn: o.nameEn,
        type: o.type,
        label: formatOfficeLabel(o),
      })),
    });
  } catch (error: any) {
    console.error("Speedy offices error:", error);
    return NextResponse.json(
      { error: error.message || "Грешка при зареждане на офиси" },
      { status: 500 },
    );
  }
}
