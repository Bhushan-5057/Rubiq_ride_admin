import { Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  GetAllPagination,
  GetAllQuery,
} from "../../../store/api/getAllAdapter";

interface UseGetAllTableQueryOptions {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  limit?: number;
}

export function useGetAllTableQuery({
  sortBy = "createdAt",
  sortOrder = "desc",
  limit = 5,
}: UseGetAllTableQueryOptions = {}) {
  const [query, setQuery] = useState<GetAllQuery>({
    page: 1,
    limit,
    sortBy,
    sortOrder,
  });
  const [search, setSearch] = useState("");

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setQuery((current) => ({
        ...current,
        search,
        page: 1,
      }));
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [search]);

  const setSort = (nextSortBy: string) => {
    setQuery((current) => ({
      ...current,
      page: 1,
      sortBy: nextSortBy,
      sortOrder:
        current.sortBy === nextSortBy && current.sortOrder === "asc"
          ? "desc"
          : "asc",
    }));
  };

  const setStatusFilter = (status: string) => {
    setQuery((current) => ({
      ...current,
      status,
      page: 1,
    }));
  };

  return {
    query,
    search,
    setSearch,
    setQuery,
    setSort,
    setStatusFilter,
    sortMark: (field: string) =>
      query.sortBy === field ? (query.sortOrder === "asc" ? " ^" : " v") : "",
  };
}

interface SearchControlProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SearchControl({
  placeholder,
  value,
  onChange,
  className = "w-full pl-9 pr-3 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400   ",
}: SearchControlProps) {
  const [draftValue, setDraftValue] = useState(value);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    setDraftValue(value);
  }, [value]);

  useEffect(
    () => () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    },
    [],
  );

  const handleChange = (nextValue: string) => {
    setDraftValue(nextValue);

    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      onChange(nextValue);
    }, 250);
  };

  return (
    <div className="relative w-full sm:w-64 md:w-72 lg:w-80">
      <input
        type="text"
        placeholder={placeholder}
        value={draftValue}
        onChange={(event) => handleChange(event.target.value)}
        className={className}
      />
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
      />
    </div>
  );
}

interface StatusFilterControlProps {
  value?: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
}

export function StatusFilterControl({
  value = "",
  onChange,
  options,
}: StatusFilterControlProps) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-xs font-medium text-gray-700 focus:border-gray-500 focus:outline-none    sm:w-40"
    >
      <option value="">All Status</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

interface PaginationControlsProps {
  pagination: GetAllPagination;
  query: GetAllQuery;
  setQuery: Dispatch<SetStateAction<GetAllQuery>>;
}

function getPageList(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages: Array<number | "ellipsis"> = [1];
  const left = Math.max(2, currentPage - 1);
  const right = Math.min(totalPages - 1, currentPage + 1);

  if (left > 2) {
    pages.push("ellipsis");
  }

  for (let page = left; page <= right; page += 1) {
    pages.push(page);
  }

  if (right < totalPages - 1) {
    pages.push("ellipsis");
  }

  pages.push(totalPages);
  return pages;
}

export function PaginationControls({
  pagination,
  query,
  setQuery,
}: PaginationControlsProps) {
  const currentPage = pagination.page || query.page || 1;
  const limit = pagination.limit || query.limit || 5;
  const totalPages = Math.max(pagination.totalPages || 0, 1);
  const pageStart = useMemo(
    () => (pagination.total === 0 ? 0 : (currentPage - 1) * limit + 1),
    [currentPage, limit, pagination.total],
  );
  const pageEnd = Math.min(currentPage * limit, pagination.total);
  const pageList = useMemo(
    () => getPageList(currentPage, totalPages),
    [currentPage, totalPages],
  );

  const goToPage = (page: number) => {
    setQuery((current) => ({ ...current, page }));
  };

  return (
    <div className="flex flex-col gap-2 border-t border-gray-100 px-3 py-2 text-xs text-gray-600 sm:flex-row sm:items-center sm:justify-between">
      <span>
        Showing {pageStart}-{pageEnd} of {pagination.total}
      </span>
      <div className="flex flex-wrap items-center gap-2">
        <button
          disabled={currentPage <= 1}
          onClick={() => goToPage(Math.max(1, currentPage - 1))}
          className="rounded border px-3 py-1 disabled:opacity-50 bg-red-500 text-white disabled:bg-gray-300 disabled:text-gray-500"
        >
          Prev
        </button>

        {pageList.map((page, index) =>
          page === "ellipsis" ? (
            <span key={`ellipsis-${index}`} className="px-2 text-sm text-gray-500">
              …
            </span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => goToPage(page)}
              className={`rounded border px-3 py-1 text-sm ${
                page === currentPage
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {page}
            </button>
          ),
        )}

        <button
          disabled={currentPage >= totalPages}
          onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
          className="rounded border px-3 py-1 disabled:opacity-50 bg-green-500 text-white disabled:bg-gray-300 disabled:text-gray-500"
        >
          Next
        </button>
      </div>
    </div>
  );
}
