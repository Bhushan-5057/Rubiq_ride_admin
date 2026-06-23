import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { formatDate } from "../../../lib/utils";
import { StatusPill } from "./DetailUI";

export type AccountStatus = "active" | "inactive" | "blocked";
export type RiskLevel = "normal" | "warning" | "high";

export interface ComplaintStats {
  total?: number;
  open?: number;
  resolved?: number;
}

export interface RideStats {
  completed?: number;
  cancelled?: number;
  missed?: number;
}

export interface RiskAssessment {
  level?: RiskLevel;
  complaintsCount?: number;
  cancellationRate?: number;
  missedRides?: number;
  eligibleForBlockReview?: boolean;
  blockReviewReasons?: unknown[];
}

export interface RiskUser {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  contactNumber?: string;
  status?: string;
  profileCompleted?: boolean;
  approvalStatus?: string;
  documentsVerified?: boolean;
  complaints?: ComplaintStats;
  rideStats?: RideStats;
  riskAssessment?: RiskAssessment;
  blockedReason?: string;
  adminComment?: string;
  blockedAt?: string | number | Date;
  blockedBy?: unknown;
}

export const normalizeComplaintStats = (stats?: ComplaintStats) => ({
  total: stats?.total ?? 0,
  open: stats?.open ?? 0,
  resolved: stats?.resolved ?? 0,
});

export const normalizeRideStats = (stats?: RideStats) => ({
  completed: stats?.completed ?? 0,
  cancelled: stats?.cancelled ?? 0,
  missed: stats?.missed ?? 0,
});

export const normalizeRiskAssessment = (risk?: RiskAssessment) => ({
  level: risk?.level ?? "normal",
  complaintsCount: risk?.complaintsCount ?? 0,
  cancellationRate: risk?.cancellationRate ?? 0,
  missedRides: risk?.missedRides ?? 0,
  eligibleForBlockReview: risk?.eligibleForBlockReview ?? false,
  blockReviewReasons: Array.isArray(risk?.blockReviewReasons)
    ? risk.blockReviewReasons
    : [],
});

export const getUserId = (user: RiskUser) => user._id || user.id || "";

export const formatPercent = (value?: number) =>
  `${Number(value ?? 0).toFixed(Number(value ?? 0) % 1 === 0 ? 0 : 1)}%`;

const stringifyReason = (reason: unknown) => {
  if (typeof reason === "string") return reason;
  if (!reason) return "";
  if (typeof reason === "object") {
    const record = reason as Record<string, unknown>;
    return String(record.reason || record.label || record.message || JSON.stringify(reason));
  }
  return String(reason);
};

const blockedByLabel = (value: unknown) => {
  if (!value) return "N/A";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    const record = value as Record<string, any>;
    return record.name || record.email || record._id || record.$oid || "N/A";
  }
  return String(value);
};

export const formatBlockedAt = (value?: string | number | Date) => {
  if (!value) return "N/A";
  if (value instanceof Date) return formatDate(value.toISOString());
  return formatDate(String(value));
};

const riskClasses: Record<RiskLevel, string> = {
  normal: "border-green-200 bg-green-50 text-green-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  high: "border-red-200 bg-red-50 text-red-700",
};

export function RiskBadge({ risk }: { risk?: RiskAssessment }) {
  const normalized = normalizeRiskAssessment(risk);

  return (
    <span
      className={`inline-flex min-w-20 items-center justify-center rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${riskClasses[normalized.level]}`}
    >
      {normalized.level}
    </span>
  );
}

export function BlockReviewLabel({ risk }: { risk?: RiskAssessment }) {
  const normalized = normalizeRiskAssessment(risk);
  if (!normalized.eligibleForBlockReview) return null;

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
      <AlertTriangle size={13} />
      Block review eligible
    </span>
  );
}

export function RiskCompactStats({ user, includeMissed = true }: { user: RiskUser; includeMissed?: boolean }) {
  const risk = normalizeRiskAssessment(user.riskAssessment);

  return (
    <div className="mt-1 space-y-0.5 text-[11px] leading-4 text-gray-500">
      <div>C: {risk.complaintsCount} | Cancel: {formatPercent(risk.cancellationRate)}</div>
      {includeMissed && <div>Missed: {risk.missedRides}</div>}
      <BlockReviewLabel risk={user.riskAssessment} />
    </div>
  );
}

function StatStrip({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-gray-200 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</p>
      <div className="mt-2 grid grid-cols-3 gap-2">{children}</div>
    </div>
  );
}

function SmallStat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-md bg-gray-50 px-2.5 py-2">
      <p className="text-[11px] font-medium text-gray-500">{label}</p>
      <div className="mt-0.5 text-sm font-semibold text-gray-900">{value}</div>
    </div>
  );
}

export function RiskDetailPanel({ user }: { user: RiskUser }) {
  const complaints = normalizeComplaintStats(user.complaints);
  const rides = normalizeRideStats(user.rideStats);
  const risk = normalizeRiskAssessment(user.riskAssessment);
  const reasons = risk.blockReviewReasons.map(stringifyReason).filter(Boolean);
  const isBlocked = String(user.status || "").toLowerCase() === "blocked";

  return (
    <div className="space-y-3">
      <StatStrip title="Complaint statistics">
        <SmallStat label="Total" value={complaints.total} />
        <SmallStat label="Open" value={complaints.open} />
        <SmallStat label="Resolved" value={complaints.resolved} />
      </StatStrip>

      <StatStrip title="Ride statistics">
        <SmallStat label="Completed" value={rides.completed} />
        <SmallStat label="Cancelled" value={rides.cancelled} />
        <SmallStat label="Missed" value={rides.missed} />
      </StatStrip>

      <div className="rounded-lg border border-gray-200 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Risk assessment</p>
          <RiskBadge risk={user.riskAssessment} />
          <BlockReviewLabel risk={user.riskAssessment} />
        </div>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <SmallStat label="Complaint count" value={risk.complaintsCount} />
          <SmallStat label="Cancellation rate" value={formatPercent(risk.cancellationRate)} />
          <SmallStat label="Missed rides" value={risk.missedRides} />
          <SmallStat label="Eligible for block review" value={risk.eligibleForBlockReview ? "Yes" : "No"} />
        </div>
        {reasons.length > 0 && (
          <div className="mt-3 rounded-md bg-red-50 px-3 py-2">
            <p className="text-xs font-semibold text-red-700">Block review reasons</p>
            <ul className="mt-1 list-disc space-y-1 pl-4 text-xs text-red-700">
              {reasons.map((reason, index) => (
                <li key={`${reason}-${index}`}>{reason}</li>
              ))}
            </ul>
          </div>
        )}
        <p className="mt-3 text-xs text-gray-500">
          Blocking is a manual admin decision. Risk signals are shown for review only.
        </p>
      </div>

      {isBlocked && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-red-700">Block metadata</p>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <SmallStat label="Reason" value={user.blockedReason || "Not provided"} />
            <SmallStat label="Blocked at" value={formatBlockedAt(user.blockedAt)} />
            <SmallStat label="Blocked by" value={blockedByLabel(user.blockedBy)} />
          </div>
        </div>
      )}
    </div>
  );
}

export function StatusUpdateModal({
  user,
  userType,
  onClose,
  onSubmit,
}: {
  user: RiskUser;
  userType: "driver" | "passenger";
  onClose: () => void;
  onSubmit: (payload: { status: AccountStatus; blockedReason?: string; adminComment?: string; forceBlock?: boolean }) => Promise<void>;
}) {
  const initialStatus = useMemo(() => {
    const status = String(user.status || "active").toLowerCase();
    return status === "inactive" || status === "blocked" ? status : "active";
  }, [user.status]);
  const [status, setStatus] = useState<AccountStatus>(initialStatus);
  const [adminComment, setAdminComment] = useState(user.adminComment || user.blockedReason || "");
  const [forceBlock, setForceBlock] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [selectError, setSelectError] = useState(false);
  const [commentError, setCommentError] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (status !== "blocked" && status !== "inactive") {
      setAdminComment("");
      setForceBlock(false);
    }
  }, [status]);

  const isPassenger = userType === "passenger";
  const canActivate = isPassenger
    ? user.profileCompleted === true
    : user.profileCompleted === true &&
      String(user.approvalStatus).toLowerCase() === "approved" &&
      user.documentsVerified === true;

  const activeRequirementsMessage = isPassenger
    ? "Active requires the passenger profile to be completed."
    : "Active requires a completed profile, approved approval status, and verified documents.";

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (saving) return;
    setError("");
    setSelectError(false);
    setCommentError(false);
    setSuccess("");

    if (status === "active" && !canActivate) {
      setError(activeRequirementsMessage);
      setSelectError(true);
      return;
    }

    if ((status === "inactive" || status === "blocked") && !adminComment.trim()) {
      setError(
        status === "inactive"
          ? "Admin comment is required when setting status to Inactive."
          : "Admin comment is required when blocking a user."
      );
      setCommentError(true);
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        status,
        blockedReason: status === "blocked" ? adminComment.trim() : undefined,
        adminComment:
          status === "blocked" || status === "inactive"
            ? adminComment.trim()
            : undefined,
        forceBlock: status === "blocked" ? forceBlock : undefined,
      });
      setSuccess("Status updated successfully.");
    } catch (err: unknown) {
      setError(
        typeof err === "string"
          ? err
          : (err as any)?.message || "Unable to update status."
      );
    } finally {
      setSaving(false);
    }
  };

  const displayName = user.name || user.contactNumber || getUserId(user) || `${userType} user`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
        <p className="text-sm font-semibold text-gray-900">{displayName}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-600">
          <span>{user.email || user.contactNumber || "No contact detail"}</span>
          <StatusPill value={user.status} />
          <RiskBadge risk={user.riskAssessment} />
          <BlockReviewLabel risk={user.riskAssessment} />
        </div>
      </div>

      <RiskDetailPanel user={user} />

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as AccountStatus);
            setError("");
            setSelectError(false);
          }}
          disabled={saving}
          className={`h-10 w-full rounded-lg border px-3 bg-white text-sm text-gray-800 focus:border-blue-500 focus:outline-none ${
            selectError ? "border-red-500" : "border-gray-300"
          }`}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="blocked">Blocked</option>
        </select>
        {status === "active" && !canActivate && (
          <p className="mt-1 text-xs text-red-500">{activeRequirementsMessage}</p>
        )}
      </div>

      {(status === "blocked" || status === "inactive") && (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Admin comment <span className="text-red-600">*</span>
            </label>
            <textarea
              value={adminComment}
              onChange={(event) => {
                setAdminComment(event.target.value);
                setError("");
                setCommentError(false);
              }}
              disabled={saving}
              rows={4}
              className={`w-full rounded-lg px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none ${
                commentError ? "border-red-500" : "border border-gray-300"
              }`}
              placeholder="Record the admin decision and reason for blocking or inactivating."
            />
            <p className="mt-1 text-xs text-gray-500">
              Risk signals do not block this user automatically. Submit only after manual review.
            </p>
          </div>

          {status === "blocked" && (
            <div className="flex items-start gap-2">
              <input
                id="forceBlock"
                type="checkbox"
                checked={forceBlock}
                disabled={saving}
                onChange={(event) => setForceBlock(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="forceBlock" className="text-sm font-medium text-gray-700">
                Force block
              </label>
            </div>
          )}
        </div>
      )}

      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {success && (
        <p className="flex items-center gap-2 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          <CheckCircle2 size={15} />
          {success}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Updating..." : "Update status"}
        </button>
      </div>
    </form>
  );
}
