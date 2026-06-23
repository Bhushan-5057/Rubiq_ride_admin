import { Download } from "lucide-react";
import {
  ReportColumn,
  ReportRow,
  exportReportToCsv,
  formatReportValue,
} from "../../lib/reportExport";

interface ReportMeta {
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

interface ReportTableViewProps {
  title: string;
  columns: ReportColumn[];
  rows: ReportRow[];
  filenameBase: string;
  meta?: ReportRow;
  loading?: boolean;
  onDownload?: () => void;
  pagination?: ReportMeta;
  onPageChange?: (page: number) => void;
}

const flattenObject = (value: ReportRow, prefix = ""): ReportRow =>
  Object.entries(value).reduce<ReportRow>((acc, [key, entry]) => {
    const nextKey = prefix ? `${prefix}.${key}` : key;
    if (
      entry &&
      typeof entry === "object" &&
      !Array.isArray(entry) &&
      !(entry instanceof Date)
    ) {
      return { ...acc, ...flattenObject(entry as ReportRow, nextKey) };
    }
    acc[nextKey] = entry;
    return acc;
  }, {});

const buildFallbackColumns = (row?: ReportRow): ReportColumn[] =>
  Object.keys(flattenObject(row ?? {})).map((key) => ({
    key,
    label: key,
  }));

export default function ReportTableView({
  title,
  columns,
  rows,
  filenameBase,
  meta,
  loading = false,
  onDownload,
  pagination,
  onPageChange,
}: ReportTableViewProps) {

  const hiddenMetaFields = [
    "total",
    "page",
    "limit",
    "totalPages",
    "hasNextPage",
    "hasPreviousPage",
  ];

  const metaEntries = Object.entries(flattenObject(meta ?? {})).filter(
    ([key]) => !hiddenMetaFields.includes(key)
  );
  const visibleColumns = columns.length > 0 ? columns : buildFallbackColumns(rows[0] ?? meta);
  const tableRows = columns.length > 0 ? rows : rows.map((row) => flattenObject(row));
  const exportRows = tableRows.length > 0 ? tableRows : meta ? [flattenObject(meta)] : [];
  const currentPage = pagination?.page ?? 1;
  const totalPages = Math.max(pagination?.totalPages ?? 1, 1);

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
      return;
    }
    exportReportToCsv(exportRows, `${filenameBase}.csv`, visibleColumns);
  };

  return (
    <section className="compact-table overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="flex flex-col gap-2 border-b border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        <button
          type="button"
          onClick={handleDownload}
          disabled={loading || exportRows.length === 0}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-brand-500 px-3 text-xs font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-brand-300"
        >
          <Download size={15} /> Download CSV
        </button>
      </div>

      {metaEntries.length > 0 && (
        <div className="grid grid-cols-1 gap-2 border-b border-gray-100 bg-gray-50 p-3 sm:grid-cols-2 xl:grid-cols-4">
          {metaEntries.map(([key, value]) => (
            <div key={key} className="rounded-md border border-gray-100 bg-white p-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                {key}
              </p>
              <p className="mt-1 break-words text-sm font-semibold text-gray-900">
                {formatReportValue(value)}
              </p>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="px-4 py-10 text-center text-sm font-medium text-gray-600">
          Loading report...
        </div>
      ) : tableRows.length === 0 ? (
        <div className="px-4 py-10 text-center">
          <p className="text-sm font-semibold text-gray-800">No report data found</p>
          <p className="mt-1 text-xs text-gray-500">Try changing the filters and generate again.</p>
        </div>
      ) : (
        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <table className="min-w-full divide-y divide-gray-100 text-left text-xs">
            <thead className="bg-gray-50">
              <tr>
                {visibleColumns.map((column) => (
                  <th
                    key={column.key}
                    className="whitespace-nowrap px-4 py-3 font-semibold text-gray-600"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {tableRows.map((row, rowIndex) => (
                <tr key={String(row._id ?? row.id ?? rowIndex)}>
                  {visibleColumns.map((column) => (
                    <td
                      key={column.key}
                      className="max-w-[220px] truncate px-4 py-3 text-gray-700"
                      title={formatReportValue(row[column.key])}
                    >
                      {formatReportValue(row[column.key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination && onPageChange && (
        <div className="flex flex-col gap-2 border-t border-gray-100 px-3 py-2 text-xs text-gray-600 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Page {currentPage} of {totalPages}
            {typeof pagination.total === "number" ? ` (${pagination.total} total)` : ""}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1 || loading}
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              className="rounded border bg-red-500 px-3 py-1 text-white disabled:bg-gray-300 disabled:text-gray-500 disabled:opacity-50"
            >
              Prev
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages || loading}
              onClick={() => onPageChange(currentPage + 1)}
              className="rounded border bg-green-500 px-3 py-1 text-white disabled:bg-gray-300 disabled:text-gray-500 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
