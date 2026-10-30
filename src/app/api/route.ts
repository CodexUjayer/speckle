import { NextResponse } from "next/server";

/**
 * Health route — the one server-side endpoint the landing page ships with.
 * Everything else on the page is static and runs entirely in the browser.
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    project: "Speckle",
    team: "Dancing with the SARs",
    event: "NASA Space Apps Challenge 2026",
    time: new Date().toISOString(),
  });
}
