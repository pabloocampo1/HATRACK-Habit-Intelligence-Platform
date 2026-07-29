import { NextResponse } from "next/server";
import { getCurrentUser } from "@/services/authService";
import { getCashflowReport } from "@/services/finance/financeService";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user?.id) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const url = new URL(req.url);
  const months = Number(url.searchParams.get("months") || "12");

  const data = await getCashflowReport(user.id, months);
  return NextResponse.json(data);
}

