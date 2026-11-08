import "server-only";

import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { logError } from "@/lib/error-logger";

const safeMessages = [
  "Only administrators can manage fee types",
  "Only administrators can manage fee records",
  "Only administrators can record payments",
  "Enter a fee type name between 1 and 100 characters",
  "Fee amount cannot be negative",
  "Choose a valid fee frequency",
  "Fee type was not found",
  "Fee record was not found",
  "The term must belong to the selected academic year",
  "Amount due cannot be negative",
  "Amount due cannot be below recorded payments",
  "A fee record with payments cannot be reassigned",
  "Payment amount must be greater than zero",
  "Fee payments cannot exceed the amount due",
  "A record with that reference already exists.",
];

export function feeApiError(cause: unknown) {
  logError(cause, { operation: "fee-api" });
  if (cause instanceof ZodError) return NextResponse.json({ error: "Please check the required fee details and try again." }, { status: 400 });
  const message = cause instanceof Error ? cause.message : "";
  return NextResponse.json({ error: safeMessages.includes(message) ? message : "The fee request could not be completed." }, { status: 400 });
}
