import { NextRequest, NextResponse } from "next/server";
import { attendanceApiError, requireAttendanceApi } from "@/lib/attendance/api";
import { getAdminRoster } from "@/lib/attendance/data";
import { attendanceIdSchema } from "@/lib/attendance/schemas";
import { z } from "zod";

const schema = z.object({ sectionId: attendanceIdSchema, academicYearId: attendanceIdSchema, date: z.string().date() });
export async function GET(request: NextRequest) { const denied = await requireAttendanceApi(["admin"]); if (denied) return denied; try { const values = schema.parse(Object.fromEntries(request.nextUrl.searchParams)); return NextResponse.json(await getAdminRoster(values.sectionId, values.academicYearId, values.date)); } catch (error) { return attendanceApiError(error); } }
