import { NextResponse } from "next/server";
import { getStorefrontCollections } from "lib/supabase/products";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const collections = await getStorefrontCollections();
    return NextResponse.json(collections);
  } catch (error) {
    console.error("Error fetching collections:", error);
    return NextResponse.json([], { status: 500 });
  }
}
