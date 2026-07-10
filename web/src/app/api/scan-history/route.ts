import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const activeUserId = req.headers.get("x-user-id");

    if (!activeUserId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. User ID header missing." },
        { status: 401 }
      );
    }

    let scanHistoryList: any[] = [];

    try {
      // Fetch the user's analyses with their relations from Postgres
      const analyses = await prisma.jobAnalysis.findMany({
        where: { userId: activeUserId },
        include: {
          indicators: true,
          verifications: true
        },
        orderBy: { createdAt: "desc" }
      });

      scanHistoryList = analyses.map((a) => ({
        id: a.id,
        title: a.jobTitle,
        company: a.companyName,
        score: a.trustScore,
        risk: a.riskLevel,
        date: new Date(a.createdAt).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric"
        }),
        desc: a.jobDescription,
        signals: a.verifications.map((v) => `${v.signalName}: ${v.description}`),
        recs: a.safetyRecs
      }));
    } catch (dbErr) {
      console.warn("Scan History API: Database read failed. Returning empty list.", dbErr);
    }

    return NextResponse.json({
      success: true,
      data: scanHistoryList
    });
  } catch (error: any) {
    console.error("Scan History API server error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error", details: error.message || "" },
      { status: 500 }
    );
  }
}
