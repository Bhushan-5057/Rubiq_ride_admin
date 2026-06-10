import { ReactNode } from "react";
import { Star } from "lucide-react";

type Tone = "success" | "error" | "warning" | "info" | "neutral";

const toneClasses: Record<Tone, string> = {
  success:
    "bg-green-50 text-green-700 ring-green-600/20  ",
  error:
    "bg-red-50 text-red-700 ring-red-600/20  ",
  warning:
    "bg-amber-50 text-amber-700 ring-amber-600/20  ",
  info:
    "bg-blue-50 text-blue-700 ring-blue-600/20  ",
  neutral:
    "bg-gray-100 text-gray-700 ring-gray-600/10  ",
};

export function statusTone(value?: string | boolean): Tone {
  if (value === true) return "success";
  if (value === false) return "error";

  const normalized = String(value || "").toLowerCase();
  if (["active", "approved", "available", "completed", "ready", "online", "true"].includes(normalized)) {
    return "success";
  }
  if (["rejected", "blocked", "cancelled", "canceled", "missed", "false"].includes(normalized)) {
    return "error";
  }
  if (["pending", "incompleted", "inactive", "unavailable", "started", "ongoing"].includes(normalized)) {
    return "warning";
  }
  if (["accepted", "on_trip"].includes(normalized)) return "info";
  return "neutral";
}

export function StatusPill({
  value,
  label,
}: {
  value?: string | boolean | number | null;
  label?: string;
}) {
  const display =
    label ??
    (typeof value === "boolean" ? (value ? "Yes" : "No") : value || "N/A");

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ring-inset ${toneClasses[statusTone(value as any)]}`}
    >
      {display}
    </span>
  );
}

export function Section({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white  ">
      <div className="flex flex-col gap-2 border-b border-gray-100 px-4 py-3  sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-sm font-semibold text-gray-900 ">
          {title}
        </h3>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

export function InfoGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {children}
    </div>
  );
}

export function InfoItem({
  label,
  value,
  children,
}: {
  label: string;
  value?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-md bg-gray-50 px-3 py-2.5 ">
      <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500 ">
        {label}
      </p>
      <div className="mt-1 break-words text-sm font-medium text-gray-900 ">
        {children ?? value ?? "N/A"}
      </div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: ReactNode;
  helper?: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3  ">
      <p className="text-xs font-medium text-gray-500 ">
        {label}
      </p>
      <div className="mt-1 text-xl font-semibold text-gray-900 ">
        {value}
      </div>
      {helper && <div className="mt-1 text-xs text-gray-500">{helper}</div>}
    </div>
  );
}

export function StarRating({
  value = 0,
  count,
}: {
  value?: number;
  count?: number;
}) {
  const rounded = Math.round(Number(value) || 0);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            size={16}
            className={
              index < rounded
                ? "fill-amber-400 text-amber-400"
                : "text-gray-300 "
            }
          />
        ))}
      </div>
      <span className="text-sm font-medium text-gray-800 ">
        {(Number(value) || 0).toFixed(1)}
      </span>
      {typeof count === "number" && (
        <span className="text-xs text-gray-500">({count})</span>
      )}
    </div>
  );
}

export function formatBoolean(value?: boolean) {
  if (typeof value !== "boolean") return "N/A";
  return value ? "Yes" : "No";
}
