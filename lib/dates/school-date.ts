const schoolTimeZone = "Asia/Kabul";

/** Returns the current calendar date at the school, independent of the server's time zone. */
export function getCurrentSchoolDate(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: schoolTimeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${values.year}-${values.month}-${values.day}`;
}
