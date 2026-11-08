import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/api";
import { feeApiError } from "@/lib/fees/api";
import { saveFeeType } from "@/lib/fees/data";
import { feeTypeSchema } from "@/lib/fees/schemas";
export async function POST(request: NextRequest) { const denied = await requireAdminApi(); if (denied) return denied; try { const id = await saveFeeType(feeTypeSchema.parse(await request.json())); return NextResponse.json({ id }, { status: 201 }); } catch (cause) { return feeApiError(cause); } }
