import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { id, name, email, phone, address } = await req.json();

    if (!id || !name || !email) {
      return NextResponse.json({ error: "البيانات ناقصة" }, { status: 400 });
    }

    const user = await prisma.user.upsert({
      where: { email },
      update: { name, phone: phone ?? null, address: address ?? null },
      create: { id, name, email, phone: phone ?? null, address: address ?? null, role: "STAFF" },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
