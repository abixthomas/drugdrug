// app/api/algorithms/route.ts
import { NextResponse } from "next/server";
import { ALGORITHMS } from "@/lib/constants";

export async function GET() {
  return NextResponse.json({ algorithms: ALGORITHMS });
}
