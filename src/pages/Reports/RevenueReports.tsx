import { useEffect, useRef, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import ReportTableView from "../../components/reports/ReportTableView";
import {
  datedReportFilename,
  getReportMeta,
  normalizeReportRows,
  revenueReportColumns,
} from "../../components/reports/reportConfigs";
import { getRevenueReport } from "../../store/api/report-api";
import { useToast } from "../../components/ui/toast/ToastContext";
import { getApiErrorMessage } from "../../lib/apiError";

export default function RevenueReports() {
  const { showToast } = useToast();
  const silentLoadRef = useRef(true);
  const [payload, setPayload] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async (options?: { silent?: boolean }) => {
    setLoading(true);
    try {
      const response = await getRevenueReport();
      setPayload(response);
      if (!options?.silent) {
        showToast(response.message || "Revenue report generated", "success");
      }
    } catch (error) {
      showToast(getApiErrorMessage(error, "Create Revenue Report"), "error");
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

  return (
    <>
      <PageMeta title="Revenue Report" description="Revenue and payout summary" />
      <div className="space-y-4">
        <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Revenue Report</h1>
            <p className="mt-1 text-sm text-gray-500">
              Platform revenue, driver payouts, and fees at a glance.
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
          title="Revenue Report"
          description="Financial summary ready for CSV export."
          columns={revenueReportColumns}
          rows={payload ? normalizeReportRows(payload) : []}
          meta={payload ? getReportMeta(payload) : undefined}
          loading={loading}
          filenameBase={datedReportFilename("revenue-report")}
        />
      </div>
    </>
  );
}
