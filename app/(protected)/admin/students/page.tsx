import { StudentManagement } from "@/components/admin/student-management";
import { AppShell } from "@/components/shell/app-shell";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { PageHeader } from "@/components/shared/page-header";
import { getAcademicYears, getSectionOptions, listStudents } from "@/lib/admin/data";
import { requireRole } from "@/lib/auth/guards";
import { studentListQuerySchema } from "@/lib/admin/schemas";

export const metadata = { title: "Students" };
export default async function StudentsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireRole("admin");
  const [academicYears, sections] = await Promise.all([getAcademicYears(), getSectionOptions()]);
  const currentYearId = academicYears.find((year) => year.status === "current")?.id;
  const rawSearchParams = await searchParams;
  const filters = studentListQuerySchema.parse(Object.fromEntries(Object.entries(rawSearchParams).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value])));
  const initialFilters = { ...filters, academicYearId: filters.academicYearId ?? currentYearId ?? "" };
  const students = await listStudents(initialFilters);
  return <AppShell role="admin"><div className="space-y-6"><Breadcrumbs items={[{ label: "Admin", href: "/admin" }, { label: "Students" }]} /><PageHeader eyebrow="Records" title="Students" description="Maintain student records, enrollment, and primary guardian contacts. Login accounts remain optional." /><StudentManagement initialData={students} academicYears={academicYears} sections={sections} initialFilters={initialFilters} /></div></AppShell>;
}
