import { useEffect, useRef, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import ReportTableView from "../../components/reports/ReportTableView";
import {
  datedReportFilename,
  getReportMeta,
  normalizeReportRows,
  summaryReportColumns,
} from "../../components/reports/reportConfigs";
import { getSummaryReport } from "../../store/api/report-api";
import { useToast } from "../../components/ui/toast/ToastContext";
import { getApiErrorMessage } from "../../lib/apiError";

export default function SummaryReports() {
  const { showToast } = useToast();
  const silentLoadRef = useRef(true);
  const [payload, setPayload] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async (options?: { silent?: boolean }) => {
    setLoading(true);
    try {
      const response = await getSummaryReport();
      setPayload(response);
      if (!options?.silent) {
        showToast(response.message || "Summary report generated", "success");
      }
    } catch (error) {
      showToast(getApiErrorMessage(error, "Create Summary Report"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const silent = silentLoadRef.current;
    silentLoadRef.current = false;
    fetchReport({ silent });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rows = payload ? normalizeReportRows(payload) : [];
  const meta = payload ? getReportMeta(payload) : undefined;
  const knownKeys = new Set(summaryReportColumns.map((column) => column.key));
  const dynamicExtraColumns =
    rows[0]
      ? Object.keys(rows[0])
          .filter((key) => !knownKeys.has(key))
          .map((key) => ({
            key,
            label: key
              .replace(/([A-Z])/g, " $1")
              .replace(/[._]/g, " ")
              .replace(/\s+/g, " ")
              .trim()
              .replace(/^./, (char) => char.toUpperCase()),
          }))
      : [];
  const columns =
    rows.length > 0
      ? [
          ...summaryReportColumns.filter((column) =>
            Object.prototype.hasOwnProperty.call(rows[0], column.key),
          ),
          ...dynamicExtraColumns,
        ]
      : summaryReportColumns;

  return (
    <>
      <PageMeta title="Summary Report" description="Platform summary metrics" />
      <div className="space-y-4">
        <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Summary Report</h1>
            <p className="mt-1 text-sm text-gray-500">
              High-level platform metrics across users, rides, and revenue.
            </p>
          </div>
          <button
            type="button"
            onClick={() => fetchReport()}
            disabled={loading}
            className="inline-flex h-9 items-center justify-center rounded-lg bg-brand-500 px-3 text-xs font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-brand-300"
          >
            {loading ? "Refreshing..." : "Refresh Report"}
          </button>
        </div>
        <ReportTableView
          title="Summary Report"
          description="Key totals for operations overview."
          columns={columns}
          rows={rows}
          meta={meta}
          loading={loading}
          filenameBase={datedReportFilename("summary-report")}
        />
      </div>
    </>
  );
}
