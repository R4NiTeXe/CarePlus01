"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageHeader } from "@/components/shared/PageHeader";
import { usePatientDetail, useUpdatePatient } from "@/hooks/usePatients";
import { useAppSelector } from "@/store/hooks";
import { getApiErrorMessage } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ArrowLeft } from "lucide-react";

interface Visit {
  id: string;
  date: string;
  timeSlot: string;
  doctorName: string;
  department: string;
  reason: string;
  status: string;
  priority: string;
}

interface LabResult {
  parameter: string;
  value: string;
  unit: string;
  normalRange: string;
  isAbnormal: boolean;
}

interface LabOrder {
  id: string;
  testName: string;
  status: string;
  results: LabResult[];
}

interface Bill {
  id: string;
  status: string;
}

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading, isError } = usePatientDetail(id);
  const role = useAppSelector((s) => s.auth.role);
  const canEdit = role === "Admin" || role === "Doctor" || role === "Nurse";
  const updatePatient = useUpdatePatient(id);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({
    phone: "",
    email: "",
    address: "",
    bloodGroup: "O+",
    allergies: "",
    chronic: "",
    ecName: "",
    ecPhone: "",
    ecRelation: "",
  });
  const [saveError, setSaveError] = useState("");
  const p = data;

  const openEdit = (): void => {
    if (!p) return;
    setForm({
      phone: p.phone,
      email: p.email,
      address: p.address,
      bloodGroup: p.bloodGroup,
      allergies: p.allergies.join(", "),
      chronic: p.chronicConditions.join(", "),
      ecName: p.emergencyContact.name,
      ecPhone: p.emergencyContact.phone,
      ecRelation: p.emergencyContact.relation,
    });
    setSaveError("");
    setEditOpen(true);
  };

  const save = (): void => {
    setSaveError("");
    const split = (s: string): string[] =>
      s.split(",").map((x) => x.trim()).filter(Boolean);
    updatePatient.mutate(
      {
        phone: form.phone.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        bloodGroup: form.bloodGroup,
        allergies: split(form.allergies),
        chronicConditions: split(form.chronic),
        emergencyContact: {
          name: form.ecName.trim(),
          phone: form.ecPhone.trim(),
          relation: form.ecRelation.trim(),
        },
      },
      {
        onSuccess: () => setEditOpen(false),
        onError: (e) => setSaveError(getApiErrorMessage(e)),
      },
    );
  };

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Loading patient…" />
        <p className="text-sm text-muted-foreground">Fetching medical record…</p>
      </div>
    );
  }

  if (isError || !p) {
    return (
      <div>
        <PageHeader title="Patient not found" />
        <Button asChild variant="outline"><Link href="/patients"><ArrowLeft className="mr-1.5 h-4 w-4" />Back to index</Link></Button>
      </div>
    );
  }

  const visits = (p.visits ?? []) as Visit[];
  const labOrders = (p.labOrders ?? []) as LabOrder[];
  const bills = (p.bills ?? []) as Bill[];

  return (
    <div>
      <PageHeader
        title={`${p.fullName} — EMR`}
        subtitle={`${p.id} • Registered ${p.registeredDate}`}
        actions={
          <div className="flex gap-2">
            {canEdit && <Button size="sm" onClick={openEdit}>Edit chart</Button>}
            <Button asChild variant="outline" size="sm"><Link href="/patients"><ArrowLeft className="mr-1.5 h-4 w-4" />Back</Link></Button>
          </div>
        }
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-2xl shadow-card">
          <CardHeader><CardTitle>Demographics</CardTitle></CardHeader>
          <CardContent className="grid gap-1 text-sm">
            <p><span className="text-muted-foreground">Age / Gender:</span> {p.age}yr / {p.gender}</p>
            <p><span className="text-muted-foreground">Blood:</span> {p.bloodGroup}</p>
            <p><span className="text-muted-foreground">Phone:</span> {p.phone}</p>
            <p><span className="text-muted-foreground">Email:</span> {p.email || "—"}</p>
            <p><span className="text-muted-foreground">Address:</span> {p.address}</p>
            <p><span className="text-muted-foreground">Status:</span> <StatusBadge status={p.admissionStatus} /></p>
            <p className="mt-2 font-semibold">Emergency contact</p>
            <p className="text-muted-foreground">{p.emergencyContact.name} ({p.emergencyContact.relation}) — {p.emergencyContact.phone}</p>
            <p className="mt-2 font-semibold">Allergies</p>
            <p className="text-muted-foreground">{p.allergies.join(", ") || "None"}</p>
            <p className="mt-2 font-semibold">Chronic conditions</p>
            <p className="text-muted-foreground">{p.chronicConditions.join(", ") || "None"}</p>
          </CardContent>
        </Card>
      <Dialog open={editOpen} onOpenChange={(o) => { if (!o) setEditOpen(false); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edit chart — {p.fullName}</DialogTitle></DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm">Phone
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </label>
            <label className="grid gap-1 text-sm">Email
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="optional" />
            </label>
            <label className="grid gap-1 text-sm sm:col-span-2">Address
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </label>
            <label className="grid gap-1 text-sm">Blood group
              <select value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })} className="rounded-lg border border-input bg-background px-3 py-2">
                {BLOOD_GROUPS.map((b) => <option key={b}>{b}</option>)}
              </select>
            </label>
            <label className="grid gap-1 text-sm">Allergies (comma separated)
              <Input value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} placeholder="Penicillin, Dust" />
            </label>
            <label className="grid gap-1 text-sm sm:col-span-2">Chronic conditions (comma separated)
              <Input value={form.chronic} onChange={(e) => setForm({ ...form, chronic: e.target.value })} placeholder="Diabetes, Hypertension" />
            </label>
            <label className="grid gap-1 text-sm">Emergency contact
              <Input value={form.ecName} onChange={(e) => setForm({ ...form, ecName: e.target.value })} />
            </label>
            <label className="grid gap-1 text-sm">Contact phone
              <Input value={form.ecPhone} onChange={(e) => setForm({ ...form, ecPhone: e.target.value })} />
            </label>
            <label className="grid gap-1 text-sm sm:col-span-2">Relation
              <Input value={form.ecRelation} onChange={(e) => setForm({ ...form, ecRelation: e.target.value })} placeholder="Spouse, Parent…" />
            </label>
          </div>
          {saveError && <p role="alert" className="mt-3 text-sm text-red-600">{saveError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={updatePatient.isPending}>
              {updatePatient.isPending ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        <Card className="rounded-2xl shadow-card lg:col-span-2">
          <CardHeader><CardTitle>Visit timeline</CardTitle></CardHeader>
          <CardContent className="grid gap-2 text-sm">
            {visits.length === 0 && <p className="text-muted-foreground">No visits.</p>}
            {visits.map((v) => (
              <div key={v.id} className="rounded-xl border p-3">
                <p className="font-semibold">{v.date} • {v.timeSlot}</p>
                <p className="text-muted-foreground">{v.doctorName} — {v.department}</p>
                <p className="mt-1">{v.reason}</p>
                <p className="mt-1 flex gap-2"><StatusBadge status={v.status} /><StatusBadge status={v.priority} /></p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl shadow-card">
          <CardHeader><CardTitle>Diagnostics</CardTitle></CardHeader>
          <CardContent className="grid gap-2 text-sm">
            {labOrders.map((l) => (
              <div key={l.id} className="rounded-xl border p-3">
                <p className="font-semibold">{l.testName} <span className="text-muted-foreground">({l.id})</span></p>
                <p className="mt-1"><StatusBadge status={l.status} /></p>
                {l.results.map((r, i) => (
                  <p key={i} className={r.isAbnormal ? "font-semibold text-red-600" : ""}>
                    {r.parameter}: {r.value} {r.unit} <span className="text-muted-foreground">({r.normalRange})</span>
                  </p>
                ))}
              </div>
            ))}
            {labOrders.length === 0 && <p className="text-muted-foreground">No lab orders.</p>}
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-card">
          <CardHeader><CardTitle>Billing</CardTitle></CardHeader>
          <CardContent className="grid gap-2 text-sm">
            {bills.map((i) => (
              <div key={i.id} className="flex items-center justify-between rounded-xl border p-3">
                <span className="font-semibold">{i.id}</span>
                <StatusBadge status={i.status} />
              </div>
            ))}
            {bills.length === 0 && <p className="text-muted-foreground">No invoices.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
