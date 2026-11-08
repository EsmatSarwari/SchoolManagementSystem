import Link from "next/link";
import { DataTable } from "@/components/shared/data-table";
import { FeeList } from "@/components/fees/fee-list";
import { AppShell } from "@/components/shell/app-shell";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { requireRole } from "@/lib/auth/guards";
import { getAdminAttendance } from "@/lib/attendance/data";
import { getCurrentSchoolDate } from "@/lib/dates/school-date";
import { listAdminFees } from "@/lib/fees/data";

export const metadata = { title: "Operational reports" };

export default async function ReportsPage() {
  await requireRole("admin");
  const today = getCurrentSchoolDate();
  const [fees, attendance] = await Promise.all([
    listAdminFees({ page: 1, pageSize: 15 }),
    getAdminAttendance({ date: today }),
  ]);

  return <AppShell role="admin"><div className="space-y-6"><Breadcrumbs items={[{ label: "Admin", href: "/admin" }, { label: "Reports" }]} /><PageHeader eyebrow="Operations" title="Practical reports" description="Use the focused operational views below. They respect the same server-side access controls as their source records." /><section className="space-y-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-semibold">Today&apos;s attendance</h2><p className="mt-1 text-sm text-muted-foreground">A school-wide view for {today}. Open attendance to review another date or apply filters.</p></div><Link href="/admin/attendance" className="text-sm font-medium text-primary hover:underline">Open attendance records</Link></div><div className="grid gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-5">{[["Marked", attendance.summary.total], ["Present", attendance.summary.present], ["Absent", attendance.summary.absent], ["Late", attendance.summary.late], ["Attendance rate", `${attendance.summary.rate}%`]].map(([label, value]) => <div key={String(label)} className="bg-card p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-2 text-xl font-semibold">{value}</p></div>)}</div><DataTable rows={attendance.records.slice(0, 10)} emptyTitle="No attendance has been marked today" emptyDescription="Attendance records will appear here after a teacher or administrator saves a section register." columns={[{ header: "Student", cell: (record) => <div><p className="font-medium">{record.studentName}</p><p className="text-xs text-muted-foreground">{record.admissionNumber}</p></div> }, { header: "Class", cell: (record) => `${record.className} · ${record.sectionName}` }, { header: "Status", cell: (record) => <StatusBadge status={record.status} /> }, { header: "Marked by", cell: (record) => record.markedBy }]} /></section><section className="space-y-3"><div><h2 className="font-semibold">Fee status summary</h2><p className="mt-1 text-sm text-muted-foreground">The latest fee records, sorted by due date. Use fee management to filter and record payments.</p></div><FeeList fees={fees.items} showStudent /></section></div></AppShell>;
}
