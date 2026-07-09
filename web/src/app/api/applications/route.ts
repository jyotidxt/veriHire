import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

// GET: Query all tracked job applications
export async function GET(req: NextRequest) {
  try {
    let activeUserId = req.headers.get("x-user-id") || "system_default_user";
    try {
      const authSession = auth();
      if (authSession && authSession.userId) {
        activeUserId = authSession.userId;
      }
    } catch (e) {
      // Bypassed if session context is missing
    }

    const applications = await prisma.savedJob.findMany({
      where: { userId: activeUserId },
      orderBy: { savedAt: "desc" }
    });

    return NextResponse.json({ success: true, data: applications });
  } catch (error: any) {
    console.error("GET /api/applications error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error", details: error.message || "" },
      { status: 500 }
    );
  }
}

// PATCH: Update status, notes, or reminder date for an application
export async function PATCH(req: NextRequest) {
  try {
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json(
        { success: false, error: "Invalid JSON payload in request body." },
        { status: 400 }
      );
    }

    const { id, status, notes, reminderDate } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { success: false, error: "Application ID ('id') is a required string parameter." },
        { status: 400 }
      );
    }

    // Prepare update parameters
    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (reminderDate !== undefined) {
      updateData.reminderDate = reminderDate ? new Date(reminderDate) : null;
    }

    const updatedApplication = await prisma.savedJob.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ success: true, data: updatedApplication });
  } catch (error: any) {
    console.error("PATCH /api/applications error:", error);
    return NextResponse.json(
      { success: false, error: "Database operation failed", details: error.message || "" },
      { status: 500 }
    );
  }
}

// DELETE: Remove an application from tracking
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { success: false, error: "Application ID ('id') is a required query parameter." },
        { status: 400 }
      );
    }

    await prisma.savedJob.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "Application removed successfully." });
  } catch (error: any) {
    console.error("DELETE /api/applications error:", error);
    return NextResponse.json(
      { success: false, error: "Database operation failed", details: error.message || "" },
      { status: 500 }
    );
  }
}

// POST: Add a new saved job tracker card
export async function POST(req: NextRequest) {
  try {
    let activeUserId = req.headers.get("x-user-id") || "system_default_user";
    let activeUserEmail = req.headers.get("x-user-email") || "user@verihire.app";
    let activeUserName = req.headers.get("x-user-name") || "Active User";

    try {
      const authSession = auth();
      if (authSession && authSession.userId) {
        activeUserId = authSession.userId;
      }
    } catch (e) {}

    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json(
        { success: false, error: "Invalid JSON payload in request body." },
        { status: 400 }
      );
    }

    const { title, company, location, url, score, risk, status } = body;

    if (!title || !company) {
      return NextResponse.json(
        { success: false, error: "Job title and company name are required parameters." },
        { status: 400 }
      );
    }

    // Generate unique jobIdExternal to satisfy schema unique index constraint
    const jobIdExternal = `${title}_${company}`.toLowerCase().replace(/[^a-z0-9]/g, "_");

    // Ensure User profile exists before inserting related savedJob
    await prisma.user.upsert({
      where: { id: activeUserId },
      update: {},
      create: {
        id: activeUserId,
        email: activeUserEmail,
        fullName: activeUserName,
        subscriptionTier: "FREE"
      }
    });

    const savedJob = await prisma.savedJob.upsert({
      where: {
        userId_jobIdExternal: {
          userId: activeUserId,
          jobIdExternal
        }
      },
      update: {
        status: status || "SAVED",
        trustScore: score ? parseInt(score.toString(), 10) : 80,
        riskLevel: (risk || "LOW") as any
      },
      create: {
        userId: activeUserId,
        jobIdExternal,
        jobTitle: title,
        companyName: company,
        trustScore: score ? parseInt(score.toString(), 10) : 80,
        riskLevel: (risk || "LOW") as any,
        status: status || "SAVED"
      }
    });

    return NextResponse.json({ success: true, data: savedJob });
  } catch (error: any) {
    console.error("POST /api/applications error:", error);
    return NextResponse.json(
      { success: false, error: "Database write failed", details: error.message || "" },
      { status: 500 }
    );
  }
}
