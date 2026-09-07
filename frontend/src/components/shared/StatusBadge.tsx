import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const styles: Record<string, string> = {
  // appointments
  Waiting: "bg-[#E6F3EF] text-[#0B423C] hover:bg-[#E6F3EF]",
  "In Triage": "bg-[#fef2d6] text-[#965f0e] hover:bg-[#fef2d6]",
  "With Doctor": "bg-[#e8e4fb] text-[#4a3d9e] hover:bg-[#e8e4fb]",
  Completed: "bg-[#e6f5e8] text-[#2e7d32] hover:bg-[#e6f5e8]",
  Cancelled: "bg-[#fde8e8] text-[#c62828] hover:bg-[#fde8e8]",
  // priority
  Routine: "bg-[#E6F3EF] text-[#0B423C] hover:bg-[#E6F3EF]",
  Urgent: "bg-[#fef2d6] text-[#965f0e] hover:bg-[#fef2d6]",
  Emergency: "bg-[#fde8e8] text-[#c62828] hover:bg-[#fde8e8]",
  // beds / general
  Vacant: "bg-[#e6f5e8] text-[#2e7d32] hover:bg-[#e6f5e8]",
  Occupied: "bg-[#fde8e8] text-[#c62828] hover:bg-[#fde8e8]",
  Sanitizing: "bg-[#fef2d6] text-[#965f0e] hover:bg-[#fef2d6]",
  Reserved: "bg-[#E6F3EF] text-[#0B423C] hover:bg-[#E6F3EF]",
  // stock / invoice / lab
  Healthy: "bg-[#e6f5e8] text-[#2e7d32] hover:bg-[#e6f5e8]",
  "Low Stock": "bg-[#fef2d6] text-[#965f0e] hover:bg-[#fef2d6]",
  Expired: "bg-[#fde8e8] text-[#c62828] hover:bg-[#fde8e8]",
  Paid: "bg-[#e6f5e8] text-[#2e7d32] hover:bg-[#e6f5e8]",
  Partial: "bg-[#fef2d6] text-[#965f0e] hover:bg-[#fef2d6]",
  Unpaid: "bg-[#fde8e8] text-[#c62828] hover:bg-[#fde8e8]",
  Ordered: "bg-[#E6F3EF] text-[#0B423C] hover:bg-[#E6F3EF]",
  "Sample Collected": "bg-[#fef2d6] text-[#965f0e] hover:bg-[#fef2d6]",
  "Under Analysis": "bg-[#e8e4fb] text-[#4a3d9e] hover:bg-[#e8e4fb]",
  "Report Approved": "bg-[#e6f5e8] text-[#2e7d32] hover:bg-[#e6f5e8]",
  OPD: "bg-[#E6F3EF] text-[#0B423C] hover:bg-[#E6F3EF]",
  Admitted: "bg-[#fef2d6] text-[#965f0e] hover:bg-[#fef2d6]",
  Discharged: "bg-[#e6f5e8] text-[#2e7d32] hover:bg-[#e6f5e8]",
  Available: "bg-[#e6f5e8] text-[#2e7d32] hover:bg-[#e6f5e8]",
  "In OPD": "bg-[#E6F3EF] text-[#0B423C] hover:bg-[#E6F3EF]",
  "In Surgery": "bg-[#fef2d6] text-[#965f0e] hover:bg-[#fef2d6]",
  "On Leave": "bg-[#fde8e8] text-[#c62828] hover:bg-[#fde8e8]",
  "On Duty": "bg-[#e6f5e8] text-[#2e7d32] hover:bg-[#e6f5e8]",
  "Off Duty": "bg-[#E6F3EF] text-[#0B423C] hover:bg-[#E6F3EF]",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <Badge variant="secondary" className={cn("whitespace-nowrap font-medium", styles[status] ?? "", className)}>
      {status}
    </Badge>
  );
}
