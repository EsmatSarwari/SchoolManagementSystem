"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FeeList } from "@/components/fees/fee-list";
import { requestJson } from "@/lib/admin/client";
import { formatAfghani } from "@/lib/fees/money";
import type { FeeRow } from "@/lib/fees/data";

type Setup = Awaited<ReturnType<typeof import("@/lib/fees/data").getFeeSetup>>;
type Section = "records" | "add-fee" | "record-payment" | "fee-types";
type FeeType = Setup["types"][number];
const controlClass = "h-10 w-full rounded-md border bg-background px-3 text-sm";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-1.5 text-sm font-medium">{label}{children}</label>;
}

export function FeeManagement({ initialSetup, initialFees }: { initialSetup: Setup; initialFees: { items: FeeRow[]; total: number; page: number; pageSize: number } }) {
  const cache = useQueryClient();
  const [section, setSection] = useState<Section>("records");
  const [setup, setSetup] = useState(initialSetup);
  const [selectedTypeId, setSelectedTypeId] = useState("");
  const [selectedYearId, setSelectedYearId] = useState(initialSetup.years.find((year) => year.status === "current")?.id ?? "");
  const [selectedRecordId, setSelectedRecordId] = useState("");
  const today = new Date().toISOString().slice(0, 10);
  const fees = useQuery({ queryKey: ["fees"], queryFn: () => requestJson<typeof initialFees>("/api/admin/fees?pageSize=50"), initialData: initialFees });
  const submit = useMutation({
    mutationFn: ({ path, body }: { path: string; body: unknown }) => requestJson<{ id?: string }>(path, { method: "POST", body: JSON.stringify(body) }),
    onError: (cause) => toast.error(cause.message),
  });
  const outstandingFees = (fees.data?.items ?? []).filter((fee) => fee.balance > 0);
  const selectedType = setup.types.find((type) => type.id === selectedTypeId);
  const selectedRecord = outstandingFees.find((fee) => fee.id === selectedRecordId);
  const currentTerms = setup.terms.filter((term) => term.academic_year_id === selectedYearId);
  const refreshFees = () => cache.invalidateQueries({ queryKey: ["fees"] });
  const navigation: Array<{ id: Section; label: string }> = [
    { id: "records", label: "Fee records" },
    { id: "add-fee", label: "Add fee" },
    { id: "record-payment", label: "Record payment" },
    { id: "fee-types", label: "Fee types" },
  ];

  return <div className="space-y-6">
    <nav className="flex flex-wrap gap-2" aria-label="Fee tasks">{navigation.map((item) => <Button key={item.id} type="button" variant={section === item.id ? "default" : "outline"} onClick={() => setSection(item.id)}>{item.label}</Button>)}</nav>

    {section === "records" ? <section className="space-y-4"><div><h2 className="font-semibold">Fee records</h2><p className="mt-1 text-sm text-muted-foreground">Review balances and payments in one place.</p></div><FeeList fees={fees.data?.items ?? []} showStudent /></section> : null}

    {section === "add-fee" ? <section className="max-w-2xl rounded-lg border bg-card p-5"><h2 className="font-semibold">Add a fee</h2><p className="mt-1 text-sm text-muted-foreground">Select a student and fee type. The usual amount fills in automatically.</p><form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); submit.mutate({ path: "/api/admin/fees/records", body: { studentId: form.get("studentId"), feeTypeId: form.get("feeTypeId"), academicYearId: form.get("academicYearId"), termId: form.get("termId"), amountDue: form.get("amountDue"), dueDate: form.get("dueDate"), notes: "" } }, { onSuccess: () => { toast.success("Fee added."); event.currentTarget.reset(); setSelectedTypeId(""); refreshFees(); setSection("records"); } }); }}><Field label="Student"><select name="studentId" className={controlClass} required><option value="">Choose a student</option>{setup.students.map((student) => <option key={student.id} value={student.id}>{student.name} · {student.admissionNumber}</option>)}</select></Field><Field label="Fee type"><select name="feeTypeId" className={controlClass} value={selectedTypeId} onChange={(event) => setSelectedTypeId(event.target.value)} required><option value="">Choose a fee type</option>{setup.types.filter((type) => type.isActive).map((type) => <option key={type.id} value={type.id}>{type.name} · {formatAfghani(type.defaultAmount)}</option>)}</select></Field><Field label="Academic year"><select name="academicYearId" className={controlClass} value={selectedYearId} onChange={(event) => setSelectedYearId(event.target.value)} required><option value="">Choose an academic year</option>{setup.years.map((year) => <option key={year.id} value={year.id}>{year.name}</option>)}</select></Field><Field label="Term (optional)"><select name="termId" className={controlClass}><option value="">No term</option>{currentTerms.map((term) => <option key={term.id} value={term.id}>{term.name}</option>)}</select></Field><Field label="Amount due (AFN)"><Input key={selectedTypeId} name="amountDue" type="number" min="0" step="0.01" defaultValue={selectedType ? String(selectedType.defaultAmount) : ""} required /></Field><Field label="Due date"><Input name="dueDate" type="date" defaultValue={today} required /></Field><div className="md:col-span-2"><Button disabled={submit.isPending} className="w-full">{submit.isPending ? "Saving…" : "Add fee"}</Button></div></form></section> : null}

    {section === "record-payment" ? <section className="max-w-2xl rounded-lg border bg-card p-5"><h2 className="font-semibold">Record a payment</h2><p className="mt-1 text-sm text-muted-foreground">Choose a balance, confirm the amount received, and save.</p>{outstandingFees.length ? <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); submit.mutate({ path: "/api/admin/fees/payments", body: { feeRecordId: form.get("feeRecordId"), amount: form.get("amount"), paidOn: form.get("paidOn"), paymentMethod: "Cash", receiptNumber: form.get("receiptNumber"), notes: "" } }, { onSuccess: () => { toast.success("Payment recorded."); event.currentTarget.reset(); setSelectedRecordId(""); refreshFees(); setSection("records"); } }); }}><Field label="Outstanding fee"><select name="feeRecordId" className={controlClass} value={selectedRecordId} onChange={(event) => setSelectedRecordId(event.target.value)} required><option value="">Choose a fee</option>{outstandingFees.map((fee) => <option key={fee.id} value={fee.id}>{fee.studentName} · {fee.feeType} · {formatAfghani(fee.balance)} left</option>)}</select></Field><Field label="Amount received (AFN)"><Input key={selectedRecordId} name="amount" type="number" min="0.01" max={selectedRecord?.balance} step="0.01" defaultValue={selectedRecord ? String(selectedRecord.balance) : ""} required /></Field><Field label="Payment date"><Input name="paidOn" type="date" defaultValue={today} required /></Field><Field label="Receipt number"><Input name="receiptNumber" placeholder="For example: REC-001" required /></Field><div className="md:col-span-2"><Button disabled={submit.isPending} className="w-full">{submit.isPending ? "Saving…" : "Save payment"}</Button></div></form> : <p className="mt-5 rounded-md border border-dashed p-4 text-sm text-muted-foreground">There are no outstanding fees to pay.</p>}</section> : null}

    {section === "fee-types" ? <section className="max-w-2xl rounded-lg border bg-card p-5"><h2 className="font-semibold">Fee types</h2><p className="mt-1 text-sm text-muted-foreground">Create a fee type once, then reuse it for any student.</p><form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); const name = String(form.get("name") ?? ""); const defaultAmount = String(form.get("defaultAmount") ?? ""); const frequency = String(form.get("frequency") ?? "one_time"); const academicYearId = String(form.get("academicYearId") ?? ""); submit.mutate({ path: "/api/admin/fees/types", body: { name, description: "", defaultAmount, frequency, isActive: true, academicYearId } }, { onSuccess: (result) => { if (!result.id) return toast.error("Fee type was saved, but the page could not refresh it. Please refresh this page."); const addedType: FeeType = { id: result.id, name, description: null, defaultAmount: Number(defaultAmount), frequency, isActive: true, academicYearId: academicYearId || null }; setSetup((current) => ({ ...current, types: [...current.types, addedType].sort((left, right) => left.name.localeCompare(right.name)) })); toast.success("Fee type added. You can now use it when adding a fee."); event.currentTarget.reset(); } }); }}><Field label="Fee type name"><Input name="name" placeholder="For example: Monthly tuition" required /></Field><Field label="Usual amount (AFN)"><Input name="defaultAmount" type="number" min="0" step="0.01" placeholder="For example: 2500" required /></Field><Field label="How often?"><select name="frequency" className={controlClass}><option value="one_time">One time</option><option value="monthly">Monthly</option><option value="termly">Each term</option><option value="annual">Yearly</option></select></Field><Field label="Academic year (optional)"><select name="academicYearId" className={controlClass}><option value="">All academic years</option>{setup.years.map((year) => <option key={year.id} value={year.id}>{year.name}</option>)}</select></Field><div className="md:col-span-2"><Button disabled={submit.isPending} className="w-full">{submit.isPending ? "Saving…" : "Add fee type"}</Button></div></form><div className="mt-6 border-t pt-5"><h3 className="font-medium">Available fee types</h3>{setup.types.length ? <div className="mt-3 space-y-2">{setup.types.map((type) => <p key={type.id} className="rounded-md border p-3 text-sm"><span className="font-medium">{type.name}</span> · {type.frequency.replace("_", " ")} · {formatAfghani(type.defaultAmount)}</p>)}</div> : <p className="mt-3 text-sm text-muted-foreground">No fee types have been created yet.</p>}</div></section> : null}
  </div>;
}
