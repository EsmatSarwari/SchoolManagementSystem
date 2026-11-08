import { z } from "zod";

// PostgreSQL accepts RFC 4122-shaped UUIDs with a version nibble of 0. The
// school seed and existing imported records use that valid shape, while
// Zod's stricter UUID validator rejects it before a form can be submitted.
const recordId = z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, "Choose a valid audience target.");
const role = z.enum(["admin", "teacher", "student", "parent"]);

export const announcementSchema = z.object({
  title: z.string().trim().min(1).max(180),
  body: z.string().trim().min(1).max(10000),
  status: z.enum(["draft", "published", "archived"]),
  target: z.enum(["all", "role", "class", "section", "academicYear"]),
  targetIds: z.array(z.string()).max(100),
  publishedOn: z.string().date().or(z.literal("")),
  expiresOn: z.string().date().or(z.literal("")),
}).superRefine((value, ctx) => {
  if (value.status === "published" && !value.publishedOn) ctx.addIssue({ code: "custom", path: ["publishedOn"], message: "Choose a publish date." });
  if (value.target === "all" && value.targetIds.length) ctx.addIssue({ code: "custom", path: ["targetIds"], message: "All users does not need targets." });
  if (value.target !== "all" && !value.targetIds.length) ctx.addIssue({ code: "custom", path: ["targetIds"], message: "Choose at least one target." });
  if (value.target === "role" && value.targetIds.some((target) => !role.safeParse(target).success)) ctx.addIssue({ code: "custom", path: ["targetIds"], message: "Choose one or more valid roles." });
  if (value.target !== "all" && value.target !== "role" && value.targetIds.some((target) => !recordId.safeParse(target).success)) ctx.addIssue({ code: "custom", path: ["targetIds"], message: "Choose one or more valid records." });
  if (value.publishedOn && value.expiresOn && value.expiresOn <= value.publishedOn) ctx.addIssue({ code: "custom", path: ["expiresOn"], message: "Expiry must be after publishing." });
});
