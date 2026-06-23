import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import ReportTableView from "../../components/reports/ReportTableView";
import {
  datedReportFilename,
  getReportMeta,
  normalizeReportRows,
} from "../../components/reports/reportConfigs";
import { getSummaryReport } from "../../store/api/report-api";
import { useToast } from "../../components/ui/toast/ToastContext";
import { getApiErrorMessage } from "../../lib/apiError";

export default function SummaryReports() {
  const { showToast } = useToast();
  const [payload, setPayload] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await getSummaryReport();
      setPayload(response);
      showToast(response.message || "Summary report generated", "success");
    } catch (error) {
      showToast(getApiErrorMessage(error, "Create Summary Report"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rows = payload ? normalizeReportRows(payload) : [];
  const meta = payload ? getReportMeta(payload) : undefined;

  return (
    <>
      <PageMeta title="Summary Report" description="" />
      <div className="space-y-4">
        <div className="flex justify-end rounded-lg border border-gray-200 bg-white p-3">
          <button
            type="button"
            onClick={fetchReport}
            disabled={loading}
            className="inline-flex h-9 items-center justify-center rounded-lg bg-brand-500 px-3 text-xs font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-brand-300"
          >
            {loading ? "Refreshing..." : "Refresh Report"}
          </button>
        </div>
        <ReportTableView
          title="Summary Report"
          columns={[]}
          rows={rows}
          meta={meta}
          loading={loading}
          filenameBase={datedReportFilename("summary-report")}
        />
      </div>
    </>
  );
}
