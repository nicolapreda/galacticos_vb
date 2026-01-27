import { getMatchDetails } from "@/lib/scraper";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");

    if (!url) {
        return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    try {
        const details = await getMatchDetails(url);
        if (!details) {
            return NextResponse.json({ error: "Failed to fetch details" }, { status: 500 });
        }
        return NextResponse.json(details);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
