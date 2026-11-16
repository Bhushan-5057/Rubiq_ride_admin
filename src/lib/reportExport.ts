import { saveAs } from "file-saver";
import Papa from "papaparse";

export interface ReportColumn {
  key: string;
  label: string;
}

export type ReportRow = Record<string, unknown>;

export const reportDateStamp = () => new Date().toISOString().slice(0, 10);

const MONEY_KEY =
  /(revenue|payout|fee|earnings|spent|fare|amount|price|totalDriverPayout|totalPlatformFee|totalEarnings|totalSpent|totalRevenue)/i;

const DATE_KEY = /(createdAt|updatedAt|fromDate|toDate|date)/i;

export const formatReportValue = (
  value: unknown,
  columnKey?: string,
): string => {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "Yes" : "No";

  if (typeof value === "number") {
    if (!Number.isFinite(value)) return "-";
    if (columnKey && MONEY_KEY.test(columnKey)) {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
      }).format(value);
    }
    return new Intl.NumberFormat("en-IN").format(value);
  }

  if (value instanceof Date) {
    return value.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  if (typeof value === "string" && columnKey && DATE_KEY.test(columnKey)) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }
  }

  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const isContactColumn = (column: ReportColumn) =>
  /contact|phone|mobile/i.test(`${column.key} ${column.label}`);

const formatCsvValue = (value: unknown, column: ReportColumn): string => {
  const formattedValue = formatReportValue(value, column.key);
  if (!isContactColumn(column) || formattedValue === "-") return formattedValue;

  const safeContact = formattedValue.replace(/"/g, '""');
  return `="${safeContact}"`;
};

export const buildReportRows = (rows: ReportRow[], columns: ReportColumn[]) =>
  rows.map((row) =>
    Object.fromEntries(
      columns.map((column) => [
        column.label,
        formatCsvValue(row[column.key], column),
      ]),
    ),
  );

export const exportReportToCsv = (
  rows: ReportRow[],
  filename: string,
  columns?: ReportColumn[],
) => {
  const exportRows = columns ? buildReportRows(rows, columns) : rows;
  const csv = Papa.unparse(exportRows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, filename);
};
