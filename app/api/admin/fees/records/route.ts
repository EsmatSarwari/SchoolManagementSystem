import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/api";
import { feeApiError } from "@/lib/fees/api";
import { saveFeeRecord } from "@/lib/fees/data";
import { feeRecordSchema } from "@/lib/fees/schemas";
export async function POST(request: NextRequest) { const denied = await requireAdminApi(); if (denied) return denied; try { await saveFeeRecord(feeRecordSchema.parse(await request.json())); return NextResponse.json({}, { status: 201 }); } catch (cause) { return feeApiError(cause); } }
