import { NextRequest, NextResponse } from "next/server";
import { apiError, requireAdminApi } from "@/lib/admin/api";
import { createExamSubject } from "@/lib/results/data";
import { examSubjectSchema } from "@/lib/results/schemas";
import { resultsFeatureEnabled } from "@/lib/features/results";
export async function POST(request: NextRequest) { if (!resultsFeatureEnabled) return NextResponse.json({ error: "This feature is currently unavailable." }, { status: 404 }); const denied = await requireAdminApi(); if (denied) return denied; try { await createExamSubject(examSubjectSchema.parse(await request.json())); return NextResponse.json({ ok: true }, { status: 201 }); } catch (error) { return apiError(error); } }
