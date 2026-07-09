import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const activeUserId = req.headers.get("x-user-id");

    if (!activeUserId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. User ID header missing." },
        { status: 401 }
      );
    }

    // Initialize clean empty states
    let totalEvaluated = 0;
    let averageTrustScore = 0;
    let alertsFlagged = 0;
    let savedJobsCount = 0;
    let recentScans: any[] = [];

    try {
      // 1. Fetch user analyses stats
      const analyses = await prisma.jobAnalysis.findMany({
        where: { userId: activeUserId },
        include: {
          indicators: true
        },
        orderBy: { createdAt: "desc" }
      });

      totalEvaluated = analyses.length;

      if (totalEvaluated > 0) {
        const sum = analyses.reduce((acc, a) => acc + a.trustScore, 0);
        averageTrustScore = Math.round(sum / totalEvaluated);
      }

      // Count analyses that have high/medium risk level
      alertsFlagged = analyses.filter(
        (a) => a.riskLevel === "HIGH" || a.riskLevel === "MEDIUM"
      ).length;

      // 2. Fetch saved jobs count
      savedJobsCount = await prisma.savedJob.count({
        where: { userId: activeUserId }
      });

      // 3. Map recent scans format
      recentScans = analyses.slice(0, 5).map((a) => ({
        id: a.id,
        title: a.jobTitle,
        company: a.companyName,
        score: a.trustScore,
        risk: a.riskLevel,
        date: new Date(a.createdAt).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric"
        })
      }));
    } catch (dbErr) {
      console.warn("Dashboard Stats API: Database query skipped/failed. Using empty states.", dbErr);
    }

    return NextResponse.json({
      totalEvaluated,
      averageTrust: averageTrustScore,
      alertsFlagged,
      savedJobs: savedJobsCount,
      recentScans
    });
  } catch (error: any) {
    console.error("Dashboard Stats API server error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error", details: error.message || "" },
      { status: 500 }
    );
  }
}
