"use client";

import { Button } from "@/components/ui/button";

// Shared table pager — every ledger reads page one by default; this control
// is what lets staff reach the rest of the hospital's records.
export function Pager({
  page,
  pages,
  total,
  onPage,
}: {
  page: number;
  pages: number;
  total: number;
  onPage: (page: number) => void;
}) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between gap-3 px-1 py-3 text-sm">
      <p className="text-muted-foreground">
        Page {page} of {pages} • {total} records
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          aria-label="Previous page"
        >
          ← Prev
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= pages}
          onClick={() => onPage(page + 1)}
          aria-label="Next page"
        >
          Next →
        </Button>
      </div>
    </div>
  );
}
