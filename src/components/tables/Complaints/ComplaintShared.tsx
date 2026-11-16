import { ReactNode } from "react";
import { Complaint, ComplaintRide, ComplaintUser } from "../../../store/api/complaint-api";
import { StatusPill } from "../shared/DetailUI";

export const statusOptions = ["PENDING", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;

export const categoryOptions = [
  "PAYMENT",
  "BEHAVIOUR",
  "LATE_PICKUP",
  "WRONG_ROUTE",
  "APP_ISSUE",
  "OTHER",
] as const;

type IdObject = { _id?: string; $oid?: string };
type DateObject = { $date?: string };

export const labelize = (value?: string | null) => {
  if (!value) return "-";
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

export const truncateText = (text?: string, maxLength = 30) => {
  if (!text) return "-";
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};

export const getIdValue = (value?: string | IdObject | null) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || value.$oid || "";
};

export const getDateValue = (value?: string | DateObject) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.$date || "";
};

export const formatComplaintDateTime = (value?: string | DateObject) => {
  const dateString = getDateValue(value);
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const statusToneLabel = (status?: string) => labelize(status);

export const getNextStatusOptions = (status?: string) => {
  switch (String(status || "").toUpperCase()) {
    case "PENDING":
      return ["IN_PROGRESS"] as const;
    case "IN_PROGRESS":
      return ["RESOLVED"] as const;
    case "RESOLVED":
      return ["CLOSED"] as const;
    default:
      return [] as const;
  }
};

export const getComplaintDisplayId = (complaint: Complaint, fallback: string) =>
  complaint.complaintId || getIdValue(complaint._id as any) || fallback;

export const getComplaintApiId = (complaint: Complaint) =>
  getIdValue(complaint._id as any) || complaint.complaintId || "";

export const getRideObject = (ride?: ComplaintRide | string | null) =>
  typeof ride === "object" && ride ? ride : undefined;

export const getUserObject = (user?: ComplaintUser | string | null) =>
  typeof user === "object" && user ? user : undefined;

export const getUserId = (user?: ComplaintUser | string | null) =>
  typeof user === "string" ? user : getIdValue(user);

export const getRideId = (complaint: Complaint) =>
  typeof complaint.rideId === "string"
    ? complaint.rideId
    : getIdValue(complaint.rideId);

export const getRaisedByRole = (complaint: Complaint) =>
  complaint.raisedByUser || getUserObject(complaint.raisedBy)?.role || "";

export const getAgainstRole = (complaint: Complaint) =>
  complaint.againstUser ||
  complaint.targetType ||
  getUserObject(complaint.against)?.role ||
  "";

const readLocation = (value: unknown): string => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    const record = value as Record<string, any>;
    return (
      record.address ||
      record.location ||
      record.name ||
      record.formattedAddress ||
      ""
    );
  }
  return "";
};

export const getRidePickup = (ride?: ComplaintRide | string | null) => {
  const rideObject = getRideObject(ride);
  return (
    readLocation(rideObject?.pickupLocation) ||
    readLocation(rideObject?.pickup) ||
    rideObject?.pickupAddress ||
    ""
  );
};

export const getRideDropoff = (ride?: ComplaintRide | string | null) => {
  const rideObject = getRideObject(ride);
  return (
    readLocation(rideObject?.dropoffLocation) ||
    readLocation(rideObject?.dropoff) ||
    readLocation(rideObject?.drop) ||
    rideObject?.dropoffAddress ||
    rideObject?.dropAddress ||
    ""
  );
};

export const getRideFare = (ride?: ComplaintRide | string | null) => {
  const rideObject = getRideObject(ride);
  const fare = rideObject?.fare ?? rideObject?.fareEstimate;
  return typeof fare === "number" ? `Rs. ${fare}` : "";
};

export function PartySummary({
  user,
  role,
  fallback = "System",
}: {
  user?: ComplaintUser | string | null;
  role?: string;
  fallback?: string;
}) {
  const userObject = getUserObject(user);
  const userId = getUserId(user);
  const displayName = userObject?.name || (role ? labelize(role) : "") || fallback;

  return (
    <div className="flex min-w-[130px] max-w-[180px] flex-col">
      <span className="truncate text-sm font-medium text-gray-800" title={displayName}>
        {displayName}
      </span>
      <span
        className="truncate text-xs text-gray-500"
        title={labelize(role)}
      >
        {labelize(role)}
      </span>
    </div>
  );
}

function DetailTable({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; value?: ReactNode; show?: boolean }[];
}) {
  const visibleRows = rows.filter((row) => row.show !== false);

  return (
    <section className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="border-b border-gray-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="max-w-full overflow-x-auto">
        <table className="w-full min-w-[620px] text-left text-sm">
          <tbody className="divide-y divide-gray-100">
            {visibleRows.map((row) => (
              <tr key={row.label}>
                <th className="w-56 bg-gray-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {row.label}
                </th>
                <td className="px-4 py-3 font-medium text-gray-900">
                  <div className="whitespace-pre-wrap break-words">
                    {row.value || "-"}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function ComplaintDetailTables({ complaint }: { complaint: Complaint }) {
  const raisedByUser = getUserObject(complaint.raisedBy);
  const againstUser = getUserObject(complaint.against);
  const raisedByRole = getRaisedByRole(complaint);
  const againstRole = getAgainstRole(complaint);
  const pickup = getRidePickup(complaint.rideId);
  const dropoff = getRideDropoff(complaint.rideId);
  const fare = getRideFare(complaint.rideId);

  return (
    <div className="space-y-4">
      <DetailTable
        title="Complaint Summary"
        rows={[
          { label: "Complaint ID", value: complaint.complaintId || getIdValue(complaint._id as any) },
          { label: "Category", value: labelize(complaint.category) },
          {
            label: "Status",
            value: (
              <StatusPill
                value={complaint.status}
                label={statusToneLabel(complaint.status)}
              />
            ),
          },
          { label: "Description", value: complaint.description },
          { label: "Admin Response", value: complaint.adminResponse, show: Boolean(complaint.adminResponse) },
          { label: "Created At", value: formatComplaintDateTime(complaint.createdAt) },
          { label: "Updated At", value: formatComplaintDateTime(complaint.updatedAt) },
        ]}
      />

      <DetailTable
        title="Raised By"
        rows={[
          { label: "Role", value: labelize(raisedByRole) },
          { label: "Name", value: raisedByUser?.name, show: Boolean(raisedByUser?.name) },
          { label: "Email", value: raisedByUser?.email, show: Boolean(raisedByUser?.email) },
          { label: "Phone", value: raisedByUser?.phone, show: Boolean(raisedByUser?.phone) },
          { label: "User ID", value: getUserId(complaint.raisedBy) },
        ]}
      />

      <DetailTable
        title="Against"
        rows={[
          { label: "Target Type", value: labelize(complaint.targetType || againstRole) },
          { label: "Role", value: labelize(againstRole), show: Boolean(againstRole) },
          { label: "Name", value: againstUser?.name, show: Boolean(againstUser?.name) },
          { label: "Email", value: againstUser?.email, show: Boolean(againstUser?.email) },
          { label: "Phone", value: againstUser?.phone, show: Boolean(againstUser?.phone) },
          { label: "User ID", value: getUserId(complaint.against), show: Boolean(getUserId(complaint.against)) },
        ]}
      />

      <DetailTable
        title="Ride Details"
        rows={[
          { label: "Ride ID", value: getRideId(complaint), show: Boolean(getRideId(complaint)) },
          { label: "Pickup", value: pickup, show: Boolean(pickup) },
          { label: "Dropoff", value: dropoff, show: Boolean(dropoff) },
          { label: "Fare", value: fare, show: Boolean(fare) },
        ]}
      />
    </div>
  );
}
