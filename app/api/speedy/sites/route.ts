import { NextRequest, NextResponse } from "next/server";
import { findSites, isSpeedyConfigured } from "lib/speedy";

export async function GET(request: NextRequest) {
  try {
    if (!isSpeedyConfigured()) {
      return NextResponse.json(
        { error: "Speedy не е конфигуриран" },
        { status: 503 },
      );
    }

    const q = request.nextUrl.searchParams.get("q") || "";
    if (q.trim().length < 2) {
      return NextResponse.json({ sites: [] });
    }

    const sites = await findSites(q);
    return NextResponse.json({
      sites: sites.map((s) => ({
        id: s.id,
        type: s.type,
        name: s.name,
        nameEn: s.nameEn,
        postCode: s.postCode,
        municipality: s.municipality,
        region: s.region,
        label: `${s.type ? `${s.type} ` : ""}${s.name}${s.postCode ? ` (${s.postCode})` : ""}`,
      })),
    });
  } catch (error: any) {
    console.error("Speedy sites error:", error);
    return NextResponse.json(
      { error: error.message || "Грешка при търсене на населено място" },
      { status: 500 },
    );
  }
}
