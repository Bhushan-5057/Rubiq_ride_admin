import { FormEvent, useEffect, useState } from "react";
import { FileText } from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import ReportTableView from "../../components/reports/ReportTableView";
import {
  datedReportFilename,
  driverReportColumns,
  getReportMeta,
  getReportPagination,
  normalizeReportRows,
  passengerReportColumns,
} from "../../components/reports/reportConfigs";
import {
  getDriverReport,
  getDriverReportById,
  getPassengerReport,
  getPassengerReportById,
  ReportListParams,
} from "../../store/api/report-api";
import { useToast } from "../../components/ui/toast/ToastContext";
import { getApiErrorMessage } from "../../lib/apiError";

type UserReportType = "drivers" | "passengers";
type ReportMode = "list" | "detail";

const inputClass =
  "h-9 rounded-lg border border-gray-300 bg-white px-3 text-xs font-medium text-gray-700 focus:border-gray-500 focus:outline-none";

export default function UserReports() {
  const { showToast } = useToast();
  const [userType, setUserType] = useState<UserReportType>("drivers");
  const [mode, setMode] = useState<ReportMode>("list");
  const [params, setParams] = useState<ReportListParams>({
    page: 1,
    limit: 10,
    fromDate: "",
    toDate: "",
  });
  const [userId, setUserId] = useState("");
  const [payload, setPayload] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);

  const isDrivers = userType === "drivers";
  const columns = isDrivers ? driverReportColumns : passengerReportColumns;
  const rows = normalizeReportRows(payload);
  const meta = getReportMeta(payload);
  const pagination = mode === "list" && payload ? getReportPagination(payload) : undefined;
  const title = `${isDrivers ? "Drivers" : "Passengers"} Report`;

  const fetchReport = async (nextParams = params) => {
    setLoading(true);
    try {
      const response =
        mode === "detail"
          ? isDrivers
            ? await getDriverReportById(userId.trim())
            : await getPassengerReportById(userId.trim())
          : isDrivers
            ? await getDriverReport(nextParams)
            : await getPassengerReport(nextParams);

      setPayload(response);
      showToast(response.message || `${title} generated`, "success");
    } catch (error) {
      showToast(getApiErrorMessage(error, `Create ${title}`), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mode === "list") fetchReport(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userType]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (mode === "detail" && !userId.trim()) {
      showToast("Please enter an ID for detail report.", "error");
      return;
    }
    fetchReport({ ...params, page: 1 });
  };

  const handlePageChange = (page: number) => {
    const nextParams = { ...params, page };
    setParams(nextParams);
    fetchReport(nextParams);
  };

  return (
    <>
      <PageMeta title="User Reports" description="" />
      <div className="space-y-4">
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-gray-200 bg-white p-3"
        >
          <div className="flex flex-col gap-2 lg:flex-row lg:items-end">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600">User Type</label>
              <select
                value={userType}
                onChange={(event) => {
                  setUserType(event.target.value as UserReportType);
                  setPayload(null);
                  setParams((current) => ({ ...current, page: 1 }));
                }}
                className={inputClass}
              >
                <option value="drivers">Drivers</option>
                <option value="passengers">Passengers</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600">Report</label>
              <select
                value={mode}
                onChange={(event) => {
                  setMode(event.target.value as ReportMode);
                  setPayload(null);
                }}
                className={inputClass}
              >
                <option value="list">All Users</option>
                <option value="detail">By ID</option>
              </select>
            </div>

            {mode === "detail" ? (
              <div className="flex min-w-[240px] flex-1 flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600">ID</label>
                <input
                  value={userId}
                  onChange={(event) => setUserId(event.target.value)}
                  placeholder={isDrivers ? "Driver ID" : "Passenger ID"}
                  className={inputClass}
                />
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-600">From</label>
                  <input
                    type="date"
                    value={params.fromDate}
                    onChange={(event) =>
                      setParams((current) => ({
                        ...current,
                        fromDate: event.target.value,
                        page: 1,
                      }))
                    }
                    className={inputClass}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-600">To</label>
                  <input
                    type="date"
                    value={params.toDate}
                    onChange={(event) =>
                      setParams((current) => ({
                        ...current,
                        toDate: event.target.value,
                        page: 1,
                      }))
                    }
                    className={inputClass}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-600">Limit</label>
                  <select
                    value={params.limit}
                    onChange={(event) =>
                      setParams((current) => ({
                        ...current,
                        limit: Number(event.target.value),
                        page: 1,
                      }))
                    }
                    className={inputClass}
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-brand-500 px-3 text-xs font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-brand-300"
            >
              <FileText size={15} />
              {loading ? "Generating..." : "Generate Report"}
            </button>
          </div>
        </form>

        <ReportTableView
          title={title}
          columns={columns}
          rows={rows}
          meta={meta}
          loading={loading}
          filenameBase={datedReportFilename(
            mode === "detail" && userId.trim()
              ? `${isDrivers ? "driver" : "passenger"}-report-${userId.trim()}`
              : `${userType}-report`,
          )}
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </div>
    </>
  );
}
