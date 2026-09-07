"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { HeartPulse } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAF7F1] p-4">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E6F3EF]">
          <HeartPulse className="h-6 w-6 text-[#0B423C]" />
        </div>
        <h2 className="text-xl font-bold text-[#103B36]">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="outline" onClick={() => router.back()}>
            Go back
          </Button>
          <Button onClick={() => router.push("/")}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
