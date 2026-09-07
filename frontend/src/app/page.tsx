"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  HeartPulse,
  Stethoscope,
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  Microscope,
  Ambulance,
  ArrowRight,
  UserRound,
  Baby,
  Bone,
  HeartHandshake,
  Brain,
  TicketCheck,
  ClipboardCheck,
  Pill,
  Siren,
} from "lucide-react";
import { useHospitalSettings } from "@/hooks/useHospitalSettings";
import { SafeImage } from "@/components/shared/SafeImage";

interface PublicDepartment {
  id: string;
  name: string;
  hod: string;
  opdRooms: number;
  icon: string;
}

interface PublicDoctor {
  id: string;
  name: string;
  qualification: string;
  department: string;
  roomNo: string;
}

interface PublicStats {
  departments: number;
  doctors: number;
  support24x7: boolean;
}

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

const DEPT_ICONS: Record<string, typeof Stethoscope> = {
  Stethoscope,
  HeartPulse,
  Baby,
  Bone,
  HeartHandshake,
  Brain,
};

const WHY_US = [
  { icon: ShieldCheck, title: "Audited clinical pathways", desc: "Infection control and medication safety checked on every ward, every day." },
  { icon: Microscope, title: "In-house diagnostics", desc: "Pathology, radiology, and pharmacy under one roof — reports in hours, not days." },
  { icon: Ambulance, title: "24×7 emergency", desc: "Round-the-clock trauma response with a dedicated emergency wing and ICU." },
  { icon: TicketCheck, title: "Token-based OPD", desc: "Take a token, track the live queue, walk in when called — no crowded halls." },
];

const HOW_IT_WORKS = [
  { icon: TicketCheck, title: "Take a token", desc: "Get your OPD token at reception in under a minute." },
  { icon: Stethoscope, title: "See your doctor", desc: "Walk in when your token is called — on time, every time." },
  { icon: Pill, title: "Reports & medicines", desc: "Collect diagnostics and prescriptions in the same building." },
];

const GALLERY = [
  { src: "/images/pediatric-care.jpg", alt: "Pediatrician caring for a small child", caption: "Gentle pediatric care" },
  { src: "/images/newborn-care.jpg", alt: "Mother holding her newborn with a nurse", caption: "Safe beginnings" },
  { src: "/images/doctor-consult.jpg", alt: "Doctor consulting a patient in the OPD", caption: "Unhurried consults" },
  { src: "/images/family-waiting.jpg", alt: "Family relaxing in a bright waiting lounge", caption: "Calm spaces" },
  { src: "/images/modern-lab.jpg", alt: "Technician working in a modern diagnostics lab", caption: "In-house diagnostics" },
  { src: "/images/surgery-care.jpg", alt: "Surgical team in a modern operation theatre", caption: "Skilled surgery" },
  { src: "/images/pharmacy-counter.jpg", alt: "Pharmacist handing medicines to a patient", caption: "On-site pharmacy" },
  { src: "/images/icu-care.jpg", alt: "Nurse monitoring a patient in the ICU", caption: "Round-the-clock ICU" },
];

const CARTOONS = [
  { src: "/images/cartoons/cartoon-lion-doctor.jpg", alt: "Friendly cartoon lion doctor waving", caption: "Dr. Leo says brush twice a day!" },
  { src: "/images/cartoons/cartoon-elephant-nurse.jpg", alt: "Cute cartoon elephant nurse smiling", caption: "Nurse Ellie keeps you brave" },
  { src: "/images/cartoons/cartoon-giraffe.jpg", alt: "Smiling cartoon giraffe with balloons", caption: "Gigi loves tall checkups" },
  { src: "/images/cartoons/cartoon-bunny-patient.jpg", alt: "Happy cartoon bunny with a bandage", caption: "Bunty got his bandage!" },
  { src: "/images/cartoons/cartoon-healthy-kids.jpg", alt: "Happy cartoon kids playing in a park", caption: "Back to play in no time" },
];

const TESTIMONIALS = [
  { quote: "My mother's knee surgery to discharge took four days. The token system meant we never waited more than ten minutes.", name: "R. Banerjee", detail: "Orthopedics patient family" },
  { quote: "Blood tests at 9 AM, doctor consult at 11 with reports in hand. Everything under one roof genuinely works.", name: "S. Iyer", detail: "General Medicine OPD" },
  { quote: "The night emergency team stabilised my father in minutes. I cannot thank the ICU staff enough.", name: "M. Khan", detail: "Emergency care family" },
];

async function getJSON<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API}${path}`, { cache: "no-store" });
    if (!res.ok) return null;
    const body = (await res.json()) as { data: T };
    return body.data;
  } catch {
    return null;
  }
}

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
};

export default function LandingPage() {
  const [departments, setDepartments] = useState<PublicDepartment[]>([]);
  const [doctors, setDoctors] = useState<PublicDoctor[]>([]);
  const [stats, setStats] = useState<PublicStats | null>(null);
  // null = still loading, true = at least one request failed
  const [loadError, setLoadError] = useState<boolean | null>(null);
  const { settings } = useHospitalSettings();
  const hasPhone = Boolean(settings.contactPhoneHref && settings.contactPhone);

  useEffect(() => {
    void (async () => {
      const [deps, docs, st] = await Promise.all([
        getJSON<PublicDepartment[]>("/public/departments"),
        getJSON<PublicDoctor[]>("/public/doctors"),
        getJSON<PublicStats>("/public/stats"),
      ]);
      setLoadError(!deps || !docs || !st);
      if (deps && deps.length > 0) setDepartments(deps.slice(0, 6));
      if (docs && docs.length > 0) setDoctors(docs.slice(0, 3));
      if (st) setStats(st);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-canvas text-foreground">
      {/* Emergency strip */}
      {hasPhone && (
        <div className="bg-red-700 text-white">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-center gap-2 px-4 py-1.5 text-xs font-semibold">
            <Siren className="h-3.5 w-3.5 animate-pulse" />
            <span>24×7 Emergency:</span>
            <a href={`tel:${settings.contactPhoneHref}`} className="underline underline-offset-2 hover:text-red-100">
              {settings.contactPhone}
            </a>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy">
            <HeartPulse className="h-5 w-5 animate-pulse text-accent" />
          </span>
          <div className="leading-tight">
            <p className="font-bold text-navy">CarePlus Hospital</p>
            <p className="text-xs text-muted-foreground">Multi-Speciality Care</p>
          </div>
          <div className="flex-1" />
          <a href="#departments" className="hidden text-sm font-medium text-muted-foreground hover:text-navy sm:block">Departments</a>
          <a href="#doctors" className="hidden text-sm font-medium text-muted-foreground hover:text-navy sm:block">Doctors</a>
          <a href="#visit" className="hidden text-sm font-medium text-muted-foreground hover:text-navy sm:block">Visit</a>
          <Button asChild size="sm">
            <Link href="/portal"><UserRound className="mr-1.5 h-4 w-4" />Staff Portal</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-navy text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-clinical/40 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-accent/20 blur-3xl"
        />
        <svg
          aria-hidden="true"
          viewBox="0 0 600 120"
          preserveAspectRatio="none"
          className="pointer-events-none absolute bottom-0 left-0 h-24 w-full text-white/10"
        >
          <polyline
            points="0,70 120,70 150,70 170,30 190,105 210,55 230,70 360,70 390,70 410,35 430,100 450,60 470,70 600,70"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
        <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <motion.div {...fadeUp}>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-accent">
              <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
              24×7 Emergency & ICU
            </p>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              Token-based OPD.
              <br />
              <span className="text-accent">Zero-hour waits.</span>
            </h1>
            <p className="mt-4 max-w-md text-white/70">
              Take a token, see your specialist on time, and collect reports and
              medicines in the same building.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
              <span className="rounded-full bg-white/10 px-3 py-1.5">
                {stats ? `${stats.departments}+ specialities` : "Multiple specialities"}
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1.5">
                {stats ? `${stats.doctors}+ specialists` : "Senior consultants"}
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1.5">Live OPD queue</span>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-accent font-semibold text-navy hover:bg-accent/90">
                <a href="#departments">Find your department <ArrowRight className="ml-1.5 h-4 w-4" /></a>
              </Button>
              {hasPhone ? (
                <Button asChild size="lg" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white">
                  <a href={`tel:${settings.contactPhoneHref}`}><Phone className="mr-1.5 h-4 w-4" />{settings.contactPhone}</a>
                </Button>
              ) : (
                <Button asChild size="lg" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white">
                  <a href="#doctors">Meet our doctors</a>
                </Button>
              )}
            </div>
          </motion.div>
          <motion.div {...fadeUp} className="grid content-center gap-4">
            <div className="overflow-hidden rounded-2xl border border-white/10 shadow-card">
              <SafeImage
                src="/images/hero-care-team.jpg"
                alt="Doctor and nurse smiling with a patient in a bright hospital corridor"
                className="aspect-[16/9] w-full"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Card className="border-white/10 bg-white/5 text-center text-white">
                <CardContent className="p-4">
                  <p className="text-3xl font-bold text-accent">{stats ? `${stats.departments}+` : "—"}</p>
                  <p className="text-xs text-white/60">Specialities</p>
                </CardContent>
              </Card>
              <Card className="border-white/10 bg-white/5 text-center text-white">
                <CardContent className="p-4">
                  <p className="text-3xl font-bold text-accent">{stats ? `${stats.doctors}+` : "—"}</p>
                  <p className="text-xs text-white/60">Specialists</p>
                </CardContent>
              </Card>
              <Card className="border-white/10 bg-white/5 text-center text-white">
                <CardContent className="p-4">
                  <p className="text-3xl font-bold text-accent">24×7</p>
                  <p className="text-xs text-white/60">Emergency</p>
                </CardContent>
              </Card>
            </div>
            <Card className="border-white/10 bg-white/5 text-white">
              <CardContent className="flex items-center gap-3 p-4 text-sm">
                <Clock className="h-5 w-5 shrink-0 text-accent" />
                {settings.opdHoursNote}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto w-full max-w-6xl px-4 py-14">
        <motion.div {...fadeUp}>
          <h2 className="text-2xl font-bold text-navy">Your visit, in three steps</h2>
          <p className="mt-1 text-sm text-muted-foreground">The same token system our staff uses every day.</p>
        </motion.div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {HOW_IT_WORKS.map((s, i) => (
            <motion.div key={s.title} {...fadeUp}>
              <Card className="h-full rounded-2xl shadow-card">
                <CardHeader className="pb-2">
                  <span className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-sm font-bold text-accent">
                      {i + 1}
                    </span>
                    <s.icon className="h-5 w-5 text-clinical" />
                  </span>
                  <CardTitle className="pt-2 text-base">{s.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">{s.desc}</CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Departments */}
      <section id="departments" className="border-y border-border bg-white">
        <div className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-14">
          <motion.div {...fadeUp}>
            <h2 className="text-2xl font-bold text-navy">Centres of excellence</h2>
            <p className="mt-1 text-sm text-muted-foreground">Led by senior consultants, backed by in-house diagnostics.</p>
          </motion.div>
          {loadError === true && departments.length === 0 && (
            <Card className="mt-6 rounded-2xl shadow-card">
              <CardContent className="p-6 text-sm text-muted-foreground">
                Department details are temporarily unavailable. Please call the hospital desk for OPD information.
              </CardContent>
            </Card>
          )}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {departments.map((d) => {
              const Icon = DEPT_ICONS[d.icon] ?? Stethoscope;
              return (
                <motion.div key={d.id} {...fadeUp}>
                  <Card className="h-full rounded-2xl shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                    <CardHeader className="flex flex-row items-center gap-3 pb-2">
                      <span className="rounded-xl bg-clinical/10 p-2.5 text-clinical">
                        <Icon className="h-5 w-5" />
                      </span>
                      <CardTitle className="text-lg">{d.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      HOD: <span className="font-medium text-foreground">{d.hod}</span>
                      <span className="mx-2 text-border">•</span>{d.opdRooms} OPD rooms
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Doctors */}
      <section id="doctors" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-14">
        <motion.div {...fadeUp}>
          <h2 className="text-2xl font-bold text-navy">Meet our specialists</h2>
          <p className="mt-1 text-sm text-muted-foreground">The consultants leading our OPDs this week.</p>
        </motion.div>
        {loadError === true && doctors.length === 0 && (
          <Card className="mt-6 rounded-2xl shadow-card">
            <CardContent className="p-6 text-sm text-muted-foreground">
              Doctor details are temporarily unavailable. Please call the hospital desk for OPD information.
            </CardContent>
          </Card>
        )}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {doctors.map((d) => (
            <motion.div key={d.id} {...fadeUp}>
              <Card className="h-full rounded-2xl shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                <CardHeader>
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-navy text-lg font-bold text-accent">
                    {d.name.replace(/^Dr\.\s*/, "").charAt(0)}
                  </span>
                  <CardTitle className="pt-2 text-lg">{d.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{d.qualification}</p>
                </CardHeader>
                <CardContent className="text-sm">
                  <span className="font-medium text-clinical">{d.department}</span>
                  <span className="mx-2 text-border">•</span>Room {d.roomNo}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Inside CarePlus — real moments, real wards */}
      <section className="border-y border-border bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-14">
          <motion.div {...fadeUp}>
            <h2 className="text-2xl font-bold text-navy">Inside CarePlus</h2>
            <p className="mt-1 text-sm text-muted-foreground">The people and places behind the care.</p>
          </motion.div>
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {GALLERY.map((g) => (
              <motion.figure key={g.src} {...fadeUp} className="group overflow-hidden rounded-2xl shadow-card">
                <div className="overflow-hidden">
                  <SafeImage
                    src={g.src}
                    alt={g.alt}
                    className="aspect-[4/3] w-full transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <figcaption className="bg-white px-3 py-2 text-xs font-medium text-muted-foreground">
                  {g.caption}
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </section>

      {/* Kids Corner — friendly cartoons for little patients (static, no animation) */}
      <section className="border-y border-border bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-14">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-clinical">Kids Corner</p>
            <h2 className="mt-1 text-2xl font-bold text-navy">Hospital feels less scary with friends</h2>
            <p className="mt-1 text-sm text-muted-foreground">Meet the buddies waiting for you in our pediatric ward.</p>
          </div>
          <div className="mt-6 overflow-hidden rounded-2xl shadow-card">
            <SafeImage
              src="/images/cartoons/cartoon-healthy-kids.jpg"
              alt="Happy cartoon kids playing together in a sunny park"
              className="aspect-[21/9] w-full"
            />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {CARTOONS.slice(0, 4).map((c) => (
              <figure key={c.src} className="overflow-hidden rounded-2xl bg-canvas shadow-card">
                <SafeImage src={c.src} alt={c.alt} className="aspect-square w-full" />
                <figcaption className="px-3 py-2 text-center text-xs font-medium text-muted-foreground">
                  {c.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section>
        <div className="mx-auto w-full max-w-6xl px-4 py-14">
          <motion.div {...fadeUp}>
            <h2 className="text-2xl font-bold text-navy">Why choose CarePlus</h2>
          </motion.div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_US.map((w) => (
              <motion.div key={w.title} {...fadeUp}>
                <Card className="h-full rounded-2xl shadow-card">
                  <CardHeader className="pb-2">
                    <span className="w-fit rounded-xl bg-clinical/10 p-2 text-clinical">
                      <w.icon className="h-5 w-5" />
                    </span>
                    <CardTitle className="text-base">{w.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">{w.desc}</CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto w-full max-w-6xl px-4 py-14">
        <motion.div {...fadeUp}>
          <h2 className="text-2xl font-bold text-navy">Families trust us</h2>
          <p className="mt-1 text-sm text-muted-foreground">Shared with permission by our patients.</p>
        </motion.div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <motion.div key={t.name} {...fadeUp}>
              <Card className="flex h-full flex-col rounded-2xl bg-navy text-white shadow-card">
                <CardContent className="flex flex-1 flex-col gap-3 p-6">
                  <span className="text-4xl font-bold leading-none text-accent">“</span>
                  <p className="flex-1 text-sm leading-relaxed text-white/85">{t.quote}</p>
                  <div>
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-xs text-white/60">{t.detail}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Visit band */}
      <section id="visit" className="scroll-mt-20 bg-clinical text-white">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-6 px-4 py-12 md:grid-cols-[1fr_320px]">
          <div className="overflow-hidden rounded-2xl border border-white/15 shadow-card md:order-2">
            <SafeImage
              src="/images/emergency-team.jpg"
              alt="Emergency entrance with ambulance and response team"
              className="aspect-[16/10] w-full"
            />
          </div>
          <div className="grid gap-4 md:order-1">
            <span className="flex items-center gap-3">
              <span className="rounded-xl bg-white/15 p-3">
                <ClipboardCheck className="h-6 w-6 text-accent" />
              </span>
              <h2 className="text-2xl font-bold">Planning a visit?</h2>
            </span>
            <p className="flex items-center gap-2 text-sm text-white/80">
              <Clock className="h-4 w-4 shrink-0 text-accent" />
              {settings.opdHoursNote}
            </p>
            {settings.address && (
              <p className="flex items-center gap-2 text-sm text-white/80">
                <MapPin className="h-4 w-4 shrink-0 text-accent" />
                {settings.address}
              </p>
            )}
            <div>
              {hasPhone ? (
                <Button asChild size="lg" className="bg-accent font-semibold text-navy hover:bg-accent/90">
                  <a href={`tel:${settings.contactPhoneHref}`}><Phone className="mr-1.5 h-4 w-4" />Call {settings.contactPhone}</a>
                </Button>
              ) : (
                <Button asChild size="lg" className="bg-accent font-semibold text-navy hover:bg-accent/90">
                  <a href="#departments">Explore departments <ArrowRight className="ml-1.5 h-4 w-4" /></a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Contact + footer */}
      <footer id="contact" className="scroll-mt-20 bg-navy text-white">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
          <div>
            <p className="flex items-center gap-2 font-bold">
              <HeartPulse className="h-5 w-5 text-accent" /> CarePlus Hospital
            </p>
            {settings.address ? (
              <p className="mt-2 flex items-start gap-2 text-sm text-white/60">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {settings.address}
              </p>
            ) : (
              <p className="mt-2 text-sm text-white/60">Visit us at the hospital reception for directions and assistance.</p>
            )}
            {hasPhone && (
              <p className="mt-1 flex items-center gap-2 text-sm text-white/60">
                <Phone className="h-4 w-4 shrink-0" />
                <a href={`tel:${settings.contactPhoneHref}`} className="hover:text-accent">{settings.contactPhone}</a>
              </p>
            )}
          </div>
          <div className="text-sm">
            <p className="font-semibold">For hospital staff</p>
            <p className="mt-2 text-white/60">Doctors, nurses, pharmacists, lab and billing desks sign in through the secure staff portal.</p>
            <Button asChild size="sm" variant="outline" className="mt-3 border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white">
              <Link href="/portal">Open Staff Portal</Link>
            </Button>
          </div>
          <div className="text-sm text-white/60 md:text-right">
            <p>© 2026 CarePlus Hospital. All rights reserved.</p>
            {settings.contactPhone && <p className="mt-1">Emergency: {settings.contactPhone}</p>}
          </div>
        </div>
      </footer>
    </div>
  );
}
