import { ReportColumn, ReportRow, reportDateStamp } from "../../lib/reportExport";

export const driverReportColumns: ReportColumn[] = [
  { key: "_id", label: "Driver ID" },
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "contactNumber", label: "Contact" },
  { key: "vehicleNumber", label: "Vehicle Number" },
  { key: "vehicleType", label: "Vehicle Type" },
  { key: "approvalStatus", label: "Approval" },
  { key: "status", label: "Status" },
  { key: "rating", label: "Rating" },
  { key: "createdAt", label: "Created At" },
  { key: "completedRides", label: "Completed" },
  { key: "cancelledRides", label: "Cancelled" },
  { key: "missedRides", label: "Missed" },
  { key: "totalEarnings", label: "Total Earnings" },
  { key: "totalDriverPayout", label: "Driver Payout" },
  { key: "totalPlatformFee", label: "Platform Fee" },
  { key: "totalComplaints", label: "Complaints" },
];

export const passengerReportColumns: ReportColumn[] = [
  { key: "_id", label: "Passenger ID" },
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "contactNumber", label: "Contact" },
  { key: "status", label: "Status" },
  { key: "rating", label: "Rating" },
  { key: "createdAt", label: "Created At" },
  { key: "totalRides", label: "Total Rides" },
  { key: "completedRides", label: "Completed" },
  { key: "cancelledRides", label: "Cancelled" },
  { key: "missedRides", label: "Missed" },
  { key: "totalSpent", label: "Total Spent" },
  { key: "totalComplaints", label: "Complaints" },
];

export const rideReportColumns: ReportColumn[] = [
  { key: "totalRides", label: "Total Rides" },
  { key: "completedRides", label: "Completed" },
  { key: "cancelledRides", label: "Cancelled" },
  { key: "missedRides", label: "Missed" },
  { key: "cab", label: "Cab Rides" },
  { key: "bike", label: "Bike Rides" },
  { key: "auto", label: "Auto Rides" },
];

export const revenueReportColumns: ReportColumn[] = [
  { key: "totalRevenue", label: "Total Revenue" },
  { key: "totalDriverPayout", label: "Driver Payout" },
  { key: "totalPlatformFee", label: "Platform Fee" },
];

export const summaryReportColumns: ReportColumn[] = [
  { key: "totalDrivers", label: "Total Drivers" },
  { key: "totalPassengers", label: "Total Passengers" },
  { key: "totalRides", label: "Total Rides" },
  { key: "completedRides", label: "Completed Rides" },
  { key: "cancelledRides", label: "Cancelled Rides" },
  { key: "missedRides", label: "Missed Rides" },
  { key: "totalRevenue", label: "Total Revenue" },
  { key: "totalDriverPayout", label: "Driver Payout" },
  { key: "totalPlatformFee", label: "Platform Fee" },
  { key: "totalComplaints", label: "Complaints" },
  { key: "activeDrivers", label: "Active Drivers" },
  { key: "activePassengers", label: "Active Passengers" },
];

export const formatMetaLabel = (key: string) => {
  const labels: Record<string, string> = {
    total: "Total Records",
    totalRecords: "Total Records",
    count: "Count",
    page: "Page",
    currentPage: "Current Page",
    limit: "Per Page",
    perPage: "Per Page",
    totalPages: "Total Pages",
    pages: "Total Pages",
    fromDate: "From Date",
    toDate: "To Date",
    generatedAt: "Generated At",
  };

  if (labels[key]) return labels[key];
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/[._]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (char) => char.toUpperCase());
};

export const normalizeReportRows = (payload: unknown): ReportRow[] => {
  const body = payload as any;
  const data = body?.data?.data ?? body?.data ?? body;
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") return [data as ReportRow];
  return [];
};

export const getReportMeta = (payload: unknown): ReportRow | undefined => {
  const body = payload as any;
  const meta = body?.data?.meta ?? body?.meta;
  return meta && typeof meta === "object" ? meta : undefined;
};

export const getReportPagination = (payload: unknown) => {
  const meta = getReportMeta(payload) ?? {};
  return {
    total: Number(meta.total ?? meta.totalRecords ?? meta.count ?? 0),
    page: Number(meta.page ?? meta.currentPage ?? 1),
    limit: Number(meta.limit ?? meta.perPage ?? 10),
    totalPages: Number(meta.totalPages ?? meta.pages ?? 1),
  };
};

export const normalizeRideReport = (payload: unknown): ReportRow[] => {
  const row = normalizeReportRows(payload)[0] ?? {};
  const vehicleType = (row.ridesByVehicleType ?? {}) as ReportRow;
  return [
    {
      totalRides: row.totalRides,
      completedRides: row.completedRides,
      cancelledRides: row.cancelledRides,
      missedRides: row.missedRides,
      cab: vehicleType.cab,
      bike: vehicleType.bike,
      auto: vehicleType.auto,
    },
  ];
};

export const datedReportFilename = (base: string) =>
  `${base}-${reportDateStamp()}`;
