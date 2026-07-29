import { NextResponse } from "next/server";
import { getCurrentUser } from "@/services/authService";
import { getCategoryBreakdown } from "@/services/finance/financeService";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user?.id) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const url = new URL(req.url);
  const months = Number(url.searchParams.get("months") || "6");

  const data = await getCategoryBreakdown(user.id, months);
  return NextResponse.json(data);
}

