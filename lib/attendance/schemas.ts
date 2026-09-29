import { z } from "zod";
import { attendanceStatuses } from "@/lib/attendance/types";

// PostgreSQL accepts RFC 4122-shaped UUIDs with a version nibble of 0, which
// are present in existing school records. Zod's z.uuid() rejects that shape.
export const attendanceIdSchema = z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, "A valid record ID is required.");

export const attendanceSaveSchema = z.object({ sectionId: attendanceIdSchema, academicYearId: attendanceIdSchema, date: z.string().date(), records: z.array(z.object({ studentId: attendanceIdSchema, status: z.enum(attendanceStatuses), remarks: z.string().trim().max(500).optional().default("") })).min(1) });
export const attendanceQuerySchema = z.object({ date: z.string().date().optional(), sectionId: attendanceIdSchema.optional(), studentId: attendanceIdSchema.optional(), status: z.enum(attendanceStatuses).optional(), academicYearId: attendanceIdSchema.optional() });
