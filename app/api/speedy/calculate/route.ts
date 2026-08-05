import { NextRequest, NextResponse } from "next/server";
import {
  calculateShipping,
  estimateParcelWeight,
  isSpeedyConfigured,
} from "lib/speedy";

export async function POST(request: NextRequest) {
  try {
    if (!isSpeedyConfigured()) {
      return NextResponse.json(
        { error: "Speedy не е конфигуриран" },
        { status: 503 },
      );
    }

    const body = await request.json();
    const siteId = Number(body.siteId);
    const officeId = body.officeId ? Number(body.officeId) : undefined;
    const itemCount = Number(body.itemCount) || 1;

    if (!siteId || Number.isNaN(siteId)) {
      return NextResponse.json(
        { error: "Изберете населено място" },
        { status: 400 },
      );
    }

    const result = await calculateShipping({
      siteId,
      officeId,
      weightKg: estimateParcelWeight(itemCount),
    });

    return NextResponse.json({
      price: result.priceTotal,
      currency: result.currency,
      serviceId: result.serviceId,
      pickupDate: result.pickupDate,
      deliveryDeadline: result.deliveryDeadline,
    });
  } catch (error: any) {
    console.error("Speedy calculate error:", error);
    return NextResponse.json(
      { error: error.message || "Грешка при изчисление на доставка" },
      { status: 500 },
    );
  }
}
