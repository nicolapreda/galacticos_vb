
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function GET(request: NextRequest) {
    const token = request.nextUrl.searchParams.get("token");

    // Optional: Check for a secret token to prevent unauthorized access
    // For simplicity appearing in the diff, we'll check match against an environment variable or a simple hardcoded expectation if you prefer, 
    // but standard practice is CRON_SECRET.
    if (process.env.CRON_SECRET && token !== process.env.CRON_SECRET) {
        return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    try {
        revalidateTag("league");
        console.log("Revalidated league data");
        return NextResponse.json({ revalidated: true, now: Date.now() });
    } catch (err) {
        return NextResponse.json({ message: "Error revalidating" }, { status: 500 });
    }
}
