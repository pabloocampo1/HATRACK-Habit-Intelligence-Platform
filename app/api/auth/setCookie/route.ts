import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { token } = await req.json();

  const res = NextResponse.json({ ok: true });

  res.cookies.set("token", token, {
    httpOnly: true, // 🔥 importante
    secure: true,
    path: "/",
  });

  return res;
}
