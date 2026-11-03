import { NextResponse } from "next/server";
import { chatModel, isSarvamConfigured, sarvamBaseUrl, ttsModel } from "@/lib/sarvam";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    configured: isSarvamConfigured(),
    chatModel: chatModel(),
    ttsModel: ttsModel(),
    baseUrl: sarvamBaseUrl(),
    checkedAt: new Date().toISOString(),
  });
}
