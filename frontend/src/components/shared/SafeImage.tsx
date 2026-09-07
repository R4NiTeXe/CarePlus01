"use client";

import { useState } from "react";
import { HeartPulse } from "lucide-react";
import { cn } from "@/lib/utils";

// Photo with a designed fallback: if the file hasn't been pasted into
// public/images yet (or fails to load), show a calm gradient tile instead of
// a broken-image icon. Sections upgrade automatically once photos exist.
export function SafeImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-navy via-clinical to-navy",
          className,
        )}
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
          <HeartPulse className="h-7 w-7 text-accent" />
        </span>
      </div>
    );
  }

  return (
    // Plain <img> is intentional: graceful onError fallback for optional
    // marketing photos that may not exist yet.
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn("object-cover", className)}
    />
  );
}
